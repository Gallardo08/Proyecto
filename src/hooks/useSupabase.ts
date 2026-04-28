import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { 
  Product, 
  Category, 
  Business, 
  ProductWithRelations,
  ProductFormData,
  ApiResponse 
} from '@/types/database';

// Hooks para Categorías
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('nombre_categoria');
      
      if (error) throw error;
      return data as Category[];
    }
  });
}

// Hooks para Products
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          business:businesses(
            id,
            nombre_negocio,
            whatsapp,
            ubicacion,
            profile_id
          ),
          category:categories(
            id,
            nombre_categoria
          )
        `)
        .eq('estado_vigencia', 'vigente')
        .order('fecha_publicacion', { ascending: false });
      
      if (error) throw error;
      return data as ProductWithRelations[];
    }
  });
}

export function useProductsByBusiness(businessId: string) {
  return useQuery({
    queryKey: ['products', 'business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(
            id,
            nombre_categoria
          )
        `)
        .eq('business_id', businessId)
        .order('fecha_publicacion', { ascending: false });
      
      if (error) throw error;
      return data as ProductWithRelations[];
    },
    enabled: !!businessId
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          business:businesses(
            id,
            nombre_negocio,
            whatsapp,
            ubicacion
          ),
          category:categories(
            id,
            nombre_categoria
          )
        `)
        .eq('category_id', categoryId)
        .eq('estado_vigencia', 'vigente')
        .order('fecha_publicacion', { ascending: false });
      
      if (error) throw error;
      return data as ProductWithRelations[];
    },
    enabled: !!categoryId
  });
}

// Hook para obtener el business del usuario actual
export function useUserBusiness() {
  return useQuery({
    queryKey: ['user-business'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('profile_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Business;
    }
  });
}

// Mutations para Products
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: ProductFormData & { business_id: string }) => {
      // Primero subir la imagen si existe
      let imagen_url: string | undefined;
      
      if (formData.imagen) {
        const fileExt = formData.imagen.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products-images')
          .upload(filePath, formData.imagen);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products-images')
          .getPublicUrl(filePath);
        
        imagen_url = publicUrl;
      }
      
      // Crear el producto
      const { data, error } = await supabase
        .from('products')
        .insert({
          business_id: formData.business_id,
          category_id: formData.category_id,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          descuento: formData.descuento,
          imagen_url
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'business'] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<ProductFormData> & { category_id?: string } 
    }) => {
      // Si hay nueva imagen, subirla
      let imagen_url: string | undefined;
      
      if (updates.imagen) {
        const fileExt = updates.imagen.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products-images')
          .upload(filePath, updates.imagen);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products-images')
          .getPublicUrl(filePath);
        
        imagen_url = publicUrl;
      }
      
      // Actualizar el producto
      const { data, error } = await supabase
        .from('products')
        .update({
          category_id: updates.category_id,
          nombre: updates.nombre,
          descripcion: updates.descripcion,
          precio: updates.precio,
          descuento: updates.descuento,
          ...(imagen_url && { imagen_url })
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'business'] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'business'] });
    }
  });
}

// Hook para crear/obtener business del usuario
export function useGetOrCreateBusiness() {
  return useMutation({
    mutationFn: async (businessData: {
      nombre_negocio: string;
      whatsapp: string;
      ubicacion?: string;
      descripcion?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Intentar obtener business existente
      const { data: existingBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('profile_id', user.id)
        .single();
      
      if (existingBusiness) return existingBusiness;
      
      // Crear nuevo business
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          profile_id: user.id,
          ...businessData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  });
}
