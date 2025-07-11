
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
          // Check if user is admin by querying profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', currentUser.id)
            .single();
          
          if (profile && profile.user_type === 'admin') {
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
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Check admin status
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();
          
          if (profile && profile.user_type === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        setLoading(false);
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

      return { data, error: null };
    } catch (error) {
      console.error('Admin login error:', error);
      return { data: null, error };
    }
  };

  return { user, isAdmin, loading, loginAsAdmin };
};
