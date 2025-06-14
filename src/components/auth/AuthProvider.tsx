import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, UserRole } from '../../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
      .select('username, role, discord_id, discord_username, discord_avatar_url, display_name, custom_avatar_url, use_discord_avatar')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;
    return profile;
  };

  const createDiscordProfile = async (authUser: any) => {
    // Extract Discord data from auth user metadata
    const discordData = authUser.user_metadata || {};
    const discordId = discordData.provider_id || authUser.id;
    const discordUsername = discordData.full_name || discordData.name || discordData.user_name || 'Unknown User';
    const discordAvatar = discordData.avatar_url || null;
    const email = authUser.email || null;

    // Generate username from Discord data
    const username = discordUsername.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const { data, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        username,
        email,
        role: 'pending' as UserRole,
        discord_id: discordId,
        discord_username: discordUsername,
        discord_avatar_url: discordAvatar,
      })
      .select()
      .single();

    if (profileError) throw profileError;
    if (!data) throw new Error('Failed to create profile');
    return data;
  };

  const updateDiscordProfile = async (userId: string, authUser: any, existingProfile: any) => {
    // Update Discord fields if they've changed
    const discordData = authUser.user_metadata || {};
    const discordId = discordData.provider_id || authUser.id;
    const discordUsername = discordData.name || discordData.full_name || discordData.user_name || 'Unknown User';
    const discordAvatar = discordData.avatar_url || discordData.picture || null;

    // Check if Discord data has actually changed to avoid unnecessary updates
    const hasChanges = 
      existingProfile.discord_id !== discordId ||
      existingProfile.discord_username !== discordUsername ||
      existingProfile.discord_avatar_url !== discordAvatar ||
      existingProfile.email !== (authUser.email || existingProfile.email);

    if (!hasChanges) {
      // Discord profile data unchanged, skipping update
      return existingProfile;
    }

    // Updating Discord profile data for user
    const { data, error: profileError } = await supabase
      .from('profiles')
      .update({
        discord_id: discordId,
        discord_username: discordUsername,
        discord_avatar_url: discordAvatar,
        email: authUser.email || existingProfile.email,
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) throw profileError;
    return data;
  };

  const handleAuthStateChange = async (session: any | null) => {
    try {
      if (!session) {
        setUser(null);
        return;
      }

      let profile = await fetchUserProfile(session.user.id);
      
      if (!profile) {
        // Create new profile for Discord user
        // Creating new Discord profile for user
        profile = await createDiscordProfile(session.user);
      } else {
        // Check if Discord is linked (either as primary provider or linked provider)
        const hasDiscordProvider = session.user.app_metadata?.providers?.includes('discord');
        const discordData = session.user.user_metadata || {};
        
        if (hasDiscordProvider && (discordData.provider_id || discordData.avatar_url)) {
          // Update existing profile with latest Discord data
          // Updating profile with Discord data for user
          profile = await updateDiscordProfile(session.user.id, session.user, profile);
        }
      }

      setUser({
        id: session.user.id,
        email: session.user.email || profile.email || '',
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role as UserRole,
        // Discord fields
        discord_id: profile.discord_id,
        discord_username: profile.discord_username,
        discord_avatar_url: profile.discord_avatar_url,
        // Custom avatar field
        custom_avatar_url: profile.custom_avatar_url,
        // Avatar preference
        use_discord_avatar: profile.use_discord_avatar,
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
      const event = _event as string;
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
  }, []); // Remove user dependency to prevent infinite loop

  // Separate useEffect for role update listener to avoid auth subscription recreation
  useEffect(() => {
    const handleRoleUpdate = (event: CustomEvent) => {
      const { userId } = event.detail;
      // If this user's role was updated, refresh their profile
      if (user && user.id === userId) {
        // User role was updated, refreshing profile
        refreshUser();
      }
    };

    // Add event listener for role updates
    window.addEventListener('user-role-updated', handleRoleUpdate as EventListener);

    return () => {
      window.removeEventListener('user-role-updated', handleRoleUpdate as EventListener);
    };
  }, [user]); // This dependency is fine since it only affects the role update listener

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

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleAuthStateChange(session);
      }
    } catch (err: any) {
      console.error('Error refreshing user profile:', err);
      setError(err.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Check if it's an invalid credentials error
        if (authError.message.includes('Invalid login credentials') || 
            authError.message.includes('Email not confirmed') ||
            authError.message.includes('User not found')) {
          throw new Error('Invalid email or password. Please check your credentials or try signing in with Discord.');
        }
        throw authError;
      }

      if (!data.user) {
        throw new Error('Authentication failed. Please try again.');
      }

      // The auth state change will be handled by the listener
      // which will call handleAuthStateChange and set up the user profile
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setError(err.message || 'Failed to sign in. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, setError, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};