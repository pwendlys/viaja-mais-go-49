
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  user_type: 'admin' | 'patient' | 'driver';
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
          // Fetch user profile and include email from auth.users
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserProfile({
              id: profile.id,
              full_name: profile.full_name,
              email: session.user.email || '',
              user_type: profile.user_type as 'admin' | 'patient' | 'driver',
              is_active: profile.is_active
            });
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
        
        if (profile) {
          setUserProfile({
            id: profile.id,
            full_name: profile.full_name,
            email: session.user.email || '',
            user_type: profile.user_type as 'admin' | 'patient' | 'driver',
            is_active: profile.is_active
          });
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

      return { data, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: {
    full_name: string;
    user_type: 'admin' | 'patient' | 'driver';
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData
        }
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: userData.full_name,
            user_type: userData.user_type
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
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
    if (!userProfile) return '/';
    
    switch (userProfile.user_type) {
      case 'admin':
        return '/admin/dashboard';
      case 'patient':
        return '/user/dashboard';
      case 'driver':
        return '/driver/dashboard';
      default:
        return '/';
    }
  };

  return {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    getRedirectPath,
    isAdmin: userProfile?.user_type === 'admin',
    isPatient: userProfile?.user_type === 'patient',
    isDriver: userProfile?.user_type === 'driver'
  };
};
