
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  user_type: 'admin';
  admin_role: string;
  is_active: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile for admin only
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && profile.user_type === 'admin') {
            setUserProfile({
              id: profile.id,
              full_name: profile.full_name,
              email: session.user.email || profile.email,
              user_type: 'admin',
              admin_role: profile.admin_role || 'admin',
              is_active: profile.is_active
            });
          } else {
            // Se não é admin, deslogar
            await supabase.auth.signOut();
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile && profile.user_type === 'admin') {
          setUserProfile({
            id: profile.id,
            full_name: profile.full_name,
            email: session.user.email || profile.email,
            user_type: 'admin',
            admin_role: profile.admin_role || 'admin',
            is_active: profile.is_active
          });
        } else {
          // Se não é admin, deslogar
          await supabase.auth.signOut();
          setUserProfile(null);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verificar se é o admin após login
      if (data.user && email !== 'admin@adm.com') {
        await supabase.auth.signOut();
        throw new Error('Acesso negado. Apenas administradores podem fazer login.');
      }

      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRedirectPath = () => {
    return '/admin/dashboard';
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signOut,
    getRedirectPath,
    isAdmin: userProfile?.user_type === 'admin'
  };
};
