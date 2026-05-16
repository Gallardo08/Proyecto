import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { 
  Category, 
  Business, 
  ProductWithRelations,
  ProductFormData
} from '@/types/database';

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function getSupabaseErrorMessage(error: SupabaseErrorLike, fallback: string) {
  const rawMessage = error.message || fallback;
  const code = error.code ? ` (${error.code})` : "";

  if (error.code === "42501" || /row-level security|rls/i.test(rawMessage)) {
    return `Supabase bloqueó la operación por políticas RLS${code}. Verifica que el negocio pertenezca al usuario autenticado.`;
  }

  if (error.code === "23503") {
    return `El negocio o la categoría seleccionada no existe${code}. Actualiza la página e intenta nuevamente.`;
  }

  if (error.code === "23502") {
    return `Falta un dato obligatorio para guardar el producto${code}.`;
  }

  return `${rawMessage}${code}`;
}

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

export function useProductsByBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: ['products', 'business', businessId],
    queryFn: async () => {
      if (!businessId) throw new Error('No se encontró el negocio del usuario');

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
        .maybeSingle();
      
      if (error) throw error;
      return data as Business | null;
    }
  });
}

// Mutations para Products
export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: ProductFormData & { business_id: string }) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(getSupabaseErrorMessage(userError, "No se pudo validar la sesión"));
      }

      if (!user) {
        throw new Error("Debes iniciar sesión para publicar productos.");
      }

      const requestedBusinessId = formData.business_id?.trim();
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (businessError) {
        throw new Error(getSupabaseErrorMessage(businessError, "No se pudo consultar tu negocio"));
      }

      if (!business?.id) {
        throw new Error("No tienes un negocio configurado. Configura tu negocio antes de publicar productos.");
      }

      if (requestedBusinessId && requestedBusinessId !== business.id) {
        throw new Error("El negocio seleccionado no pertenece al usuario autenticado.");
      }

      let imagen_url: string | undefined;
      
      if (formData.imagen) {
        const fileExt = formData.imagen.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products-images')
          .upload(filePath, formData.imagen);
        
        if (uploadError) {
          throw new Error(getSupabaseErrorMessage(uploadError, "No se pudo subir la imagen"));
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('products-images')
          .getPublicUrl(filePath);
        
        imagen_url = publicUrl;
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert({
          business_id: business.id,
          category_id: formData.category_id,
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion?.trim() || null,
          precio: formData.precio,
          descuento: formData.descuento,
          imagen_url,
          estado_vigencia: 'vigente'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(getSupabaseErrorMessage(error, "No se pudo crear el producto"));
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'business', variables.business_id] });
      queryClient.invalidateQueries({ queryKey: ['user-business'] });
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
        
        if (uploadError) {
          throw new Error(getSupabaseErrorMessage(uploadError, "No se pudo subir la imagen"));
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('products-images')
          .getPublicUrl(filePath);
        
        imagen_url = publicUrl;
      }
      
      // Actualizar el producto
      const { data, error } = await supabase
        .from('products')
        .update({
          ...(updates.category_id && { category_id: updates.category_id }),
          ...(updates.nombre !== undefined && { nombre: updates.nombre.trim() }),
          ...(updates.descripcion !== undefined && { descripcion: updates.descripcion?.trim() || null }),
          ...(updates.precio !== undefined && { precio: updates.precio }),
          ...(updates.descuento !== undefined && { descuento: updates.descuento }),
          ...(imagen_url && { imagen_url })
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(getSupabaseErrorMessage(error, "No se pudo actualizar el producto"));
      }

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
      
      if (error) {
        throw new Error(getSupabaseErrorMessage(error, "No se pudo eliminar el producto"));
      }

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
        .maybeSingle();

      if (fetchError) throw fetchError;
      
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
