
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAdminAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('admin_role')
            .eq('id', currentUser.id)
            .single();

          if (!error && profile?.admin_role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          checkAdminStatus();
        } else {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loginAsAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Se for o admin específico, criar/atualizar o usuário na tabela auth
      if (email === 'admin@admin.com') {
        // Verificar se o perfil admin existe
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profile) {
          // Criar perfil admin se não existir
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: 'Administrador Sistema',
              user_type: 'admin',
              admin_role: 'admin',
              is_active: true
            });
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Admin login error:', error);
      return { data: null, error };
    }
  };

  return { user, isAdmin, loading, loginAsAdmin };
};
