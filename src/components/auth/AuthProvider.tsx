import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;
    return profile;
  };

  const createUserProfile = async (userId: string, username: string, email: string) => {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        email,
        role: 'pending' as UserRole,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    if (!data) throw new Error('Failed to create profile');
    return data;
  };

  const handleAuthStateChange = async (session: any | null) => {
    try {
      if (!session) {
        setUser(null);
        return;
      }

      const profile = await fetchUserProfile(session.user.id);
      if (!profile) throw new Error('Profile not found');

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        username: profile.username,
        role: profile.role as UserRole,
      });
    } catch (err: any) {
      console.error('Error handling auth state change:', err);
      setError(err.message);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        handleAuthStateChange(session);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const event = _event as string; // Broaden type for comparison
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleAuthStateChange(session);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session created');

      await handleAuthStateChange(data.session);
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.session || !authData.user) {
        throw new Error('Failed to create user account');
      }

      const profile = await createUserProfile(authData.user.id, username, email);

      setUser({
        id: authData.user.id,
        email: authData.user.email || '',
        username: profile.username,
        role: profile.role as UserRole,
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, setError, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};