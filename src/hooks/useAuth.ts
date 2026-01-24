import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    // IMPORTANT: subscribe first, then read the initial session.
    // This avoids missing auth events and reduces UI flicker that can look like "logging out".
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (mounted) setIsAdmin(!!roleData);
        } else {
          setIsAdmin(false);
        }

        if (mounted) setLoading(false);
      }
    );

    // Check initial session first
    const initAuth = async () => {
      try {
        console.log('useAuth: Starting auth initialization...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('useAuth: Session error:', sessionError);
        }
        
        console.log('useAuth: Session retrieved:', { hasSession: !!session, userId: session?.user?.id });
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('useAuth: Checking admin role for user:', session.user.id);
          
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          console.log('useAuth: Admin check result:', { roleData, roleError });
          
          if (mounted) {
            setIsAdmin(!!roleData);
            console.log('useAuth: isAdmin set to:', !!roleData);
          }
        } else {
          console.log('useAuth: No session/user, skipping admin check');
        }
      } catch (error) {
        console.error('useAuth: Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('useAuth: Auth initialization complete');
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: displayName }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, signIn, signUp, signOut };
}
