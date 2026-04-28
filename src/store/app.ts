import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialProducts, type Product } from "@/data/mock";
import type { Profile, Business, Category, ProductWithRelations } from "@/types/database";

export type Role = "emprendedor" | "admin" | "visitante";

export type User = {
  id: string;
  name: string;
  business?: string;
  email: string;
  whatsapp: string;
  location?: string;
  avatar?: string;
  role: Role;
  status: "activo" | "bloqueado" | "pendiente";
  password: string;
};

type State = {
  users: User[];
  products: Product[];
  currentUserId: string | null;
  categories: string[];
  officialWhatsapp: string;
  // Datos de Supabase (cache)
  supabaseCategories: Category[];
  supabaseProducts: ProductWithRelations[];
  userBusiness: Business | null;
  // Métodos existentes (mantener compatibilidad)
  setCurrentUserFromSupabase: (u: Omit<User, "password">) => void;
  login: (id: string, password: string) => User | null;
  register: (u: Omit<User, "id" | "role" | "status">) => User;
  logout: () => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setUserStatus: (id: string, status: User["status"]) => void;
  addCategory: (c: string) => void;
  setOfficialWhatsapp: (n: string) => void;
  // Métodos nuevos para Supabase
  setSupabaseCategories: (categories: Category[]) => void;
  setSupabaseProducts: (products: ProductWithRelations[]) => void;
  setUserBusiness: (business: Business | null) => void;
  // Utilidades
  getCategoriesForSelect: () => string[];
  getProductsForCurrentUser: () => Product[];
};

const seedAdmin: User = {
  id: "admin-1",
  name: "Administrador",
  email: "admin@ofertas.com",
  whatsapp: "573000000000",
  role: "admin",
  status: "activo",
  password: "admin123",
};

const seedEmp: User = {
  id: "emp-1",
  name: "Lucy García",
  business: "Artesanías Lucy",
  email: "lucy@ofertas.com",
  whatsapp: "573002223344",
  location: "Ocaña, N. Santander",
  role: "emprendedor",
  status: "activo",
  password: "lucy123",
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      users: [seedAdmin, seedEmp],
      products: initialProducts,
      currentUserId: null,
      categories: ["Comida", "Moda", "Tecnología", "Hogar", "Belleza", "Servicios", "Artesanías"],
      officialWhatsapp: "573000000000",
      // Datos de Supabase
      supabaseCategories: [],
      supabaseProducts: [],
      userBusiness: null,
      
      setCurrentUserFromSupabase: (authUser) =>
        set((s) => {
          const existing = s.users.find((u) => u.id === authUser.id);
          const nextUser: User = { ...existing, ...authUser, password: existing?.password ?? "" };
          const users = existing
            ? s.users.map((u) => (u.id === authUser.id ? nextUser : u))
            : [...s.users, nextUser];
          return { users, currentUserId: authUser.id };
        }),

      login: (id, password) => {
        const u = get().users.find(
          (x) => (x.email === id || x.whatsapp === id) && x.password === password
        );
        if (u && u.status !== "bloqueado") {
          set({ currentUserId: u.id });
          return u;
        }
        return null;
      },
      register: (data) => {
        const user: User = {
          ...data,
          id: `emp-${Date.now()}`,
          role: "emprendedor",
          status: "activo",
        };
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
        return user;
      },
      logout: () => set({ currentUserId: null }),
      addProduct: (p) =>
        set((s) => ({ products: [{ ...p, id: `p-${Date.now()}` }, ...s.products] })),
      updateProduct: (id, p) =>
        set((s) => ({
          products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
      setUserStatus: (id, status) =>
        set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) })),
      addCategory: (c) =>
        set((s) => (s.categories.includes(c) ? s : { categories: [...s.categories, c] })),
      setOfficialWhatsapp: (n) => set({ officialWhatsapp: n }),
      
      // Métodos nuevos para Supabase
      setSupabaseCategories: (categories) => set({ supabaseCategories: categories }),
      setSupabaseProducts: (products) => set({ supabaseProducts: products }),
      setUserBusiness: (business) => set({ userBusiness: business }),
      
      // Utilidades
      getCategoriesForSelect: () => {
        const s = get();
        // Si hay categorías de Supabase, usarlas, sino las locales
        if (s.supabaseCategories.length > 0) {
          return s.supabaseCategories.map(c => c.nombre_categoria);
        }
        return s.categories;
      },
      
      getProductsForCurrentUser: () => {
        const s = get();
        const user = s.users.find(u => u.id === s.currentUserId);
        if (!user) return [];
        
        // Si hay productos de Supabase, filtrar por business
        if (s.supabaseProducts.length > 0 && s.userBusiness) {
          const businessProducts = s.supabaseProducts.filter(p => p.business_id === s.userBusiness?.id);
          // Convertir a formato antiguo para compatibilidad
          return businessProducts.map(p => ({
            id: p.id,
            name: p.nombre,
            business: p.business.nombre_negocio,
            category: p.category.nombre_categoria,
            price: Number(p.precio),
            discount: p.descuento || 0,
            description: p.descripcion || "",
            location: p.business.ubicacion || "",
            whatsapp: p.business.whatsapp,
            image: p.imagen_url || "",
            date: p.fecha_publicacion.split('T')[0]
          }));
        }
        
        // Sino usar productos locales
        return s.products.filter((p) => p.business === user.business);
      },
    }),
    { 
      name: "ofertas-ocana",
      // No persistir datos de Supabase para evitar inconsistencias
      partialize: (state) => ({
        users: state.users,
        products: state.products,
        currentUserId: state.currentUserId,
        categories: state.categories,
        officialWhatsapp: state.officialWhatsapp,
      })
    }
  )
);

export const useCurrentUser = () => {
  const { users, currentUserId } = useApp();
  return users.find((u) => u.id === currentUserId) ?? null;
};
