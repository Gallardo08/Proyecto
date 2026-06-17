import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Profile, Business } from '@/types/database';

export interface AuthUser extends User {
  profile?: Profile;
  business?: Business;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isEmprendedor: boolean;
  isAdmin: boolean;
  isActive: boolean;
  businessName?: string;
  userMetadata: {
    name: string | undefined;
    business: string | undefined;
    whatsapp: string | undefined;
    location: string | undefined;
    avatar: string | undefined;
    role: string | undefined;
    status: string | undefined;
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enrichUser = async (sessionUser: User): Promise<AuthUser> => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        let business: Business | undefined;
        if (profile?.rol === 'emprendedor') {
          const { data: businessData } = await supabase
            .from('businesses')
            .select('*')
            .eq('profile_id', sessionUser.id)
            .single();
          business = businessData || undefined;
        }

        return { ...sessionUser, profile, business };
      } catch (error) {
        console.error('Error enriqueciendo usuario:', error);
        return sessionUser;
      }
    };

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({
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
        status: user?.profile?.estado,
      },
    }),
    [user, loading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
