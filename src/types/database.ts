// Tipos basados en el esquema de Supabase para Ofertas Ocaña

export type UserRole = 'admin' | 'emprendedor';
export type ProfileEstado = 'activo' | 'bloqueado' | 'pendiente';
export type ProductEstadoVigencia = 'vigente' | 'expirado';

// Tabla: profiles
export interface Profile {
  id: string;
  rol: UserRole;
  estado: ProfileEstado;
  created_at: string;
  updated_at: string;
}

// Tabla: businesses
export interface Business {
  id: string;
  profile_id: string;
  nombre_negocio: string;
  whatsapp: string;
  ubicacion?: string;
  descripcion?: string;
  foto_perfil_url?: string;
  created_at: string;
  updated_at: string;
}

// Tabla: categories
export interface Category {
  id: string;
  nombre_categoria: string;
  created_at: string;
}

// Tabla: products
export interface Product {
  id: string;
  business_id: string;
  category_id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  descuento?: number;
  imagen_url?: string;
  fecha_publicacion: string;
  estado_vigencia: ProductEstadoVigencia;
  created_at: string;
  updated_at: string;
}

// Tabla: system_settings
export interface SystemSetting {
  key: string;
  value: string;
  updated_at: string;
}

// Tipos para relaciones completas (con joins)
export interface ProductWithRelations extends Product {
  business: Business;
  category: Category;
}

export interface BusinessWithProfile extends Business {
  profile: Profile;
}

// Tipos para formularios
export interface ProductFormData {
  nombre: string;
  descripcion?: string;
  precio: number;
  descuento?: number;
  category_id: string;
  imagen?: File;
}

export interface BusinessFormData {
  nombre_negocio: string;
  whatsapp: string;
  ubicacion?: string;
  descripcion?: string;
  foto_perfil?: File;
}

// Tipos para vistas del frontend
export interface ProductCard extends ProductWithRelations {
  precio_con_descuento?: number;
  tiene_descuento: boolean;
}

// Utilidades de tipo
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Profile>;
      };
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Business>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Category>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'fecha_publicacion' | 'created_at' | 'updated_at'>;
        Update: Partial<Product>;
      };
      system_settings: {
        Row: SystemSetting;
        Insert: Omit<SystemSetting, 'updated_at'>;
        Update: Partial<SystemSetting>;
      };
    };
  };
};

// Tipos para errores de Supabase
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}
