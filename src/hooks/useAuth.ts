import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Profile, Business } from '@/types/database';

export interface AuthUser extends User {
  profile?: Profile;
  business?: Business;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const enrichedUser = await enrichUser(session.user);
          setUser(enrichedUser);
        }
      } catch (error) {
        console.error('Error obteniendo sesión inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const enrichedUser = await enrichUser(session.user);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const enrichUser = async (user: User): Promise<AuthUser> => {
    try {
      // Obtener perfil del usuario
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Obtener business si es emprendedor
      let business: Business | undefined;
      if (profile?.rol === 'emprendedor') {
        const { data: businessData } = await supabase
          .from('businesses')
          .select('*')
          .eq('profile_id', user.id)
          .single();
        business = businessData || undefined;
      }

      return { ...user, profile, business };
    } catch (error) {
      console.error('Error enriqueciendo usuario:', error);
      return user;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
    isEmprendedor: user?.profile?.rol === 'emprendedor',
    isAdmin: user?.profile?.rol === 'admin',
    isActive: user?.profile?.estado === 'activo',
    businessName: user?.business?.nombre_negocio,
    userMetadata: {
      name: user?.user_metadata?.name || user?.email?.split('@')[0],
      business: user?.business?.nombre_negocio,
      whatsapp: user?.business?.whatsapp,
      location: user?.business?.ubicacion,
      avatar: user?.business?.foto_perfil_url,
      role: user?.profile?.rol,
      status: user?.profile?.estado
    }
  };
}
