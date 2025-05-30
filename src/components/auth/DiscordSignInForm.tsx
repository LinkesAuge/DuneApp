import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { MessageCircle, Shield, User, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const DiscordSignInForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { error: authError, setError: setAuthError } = useAuth();

  // Handle OAuth callback
  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        setAuthError(error.message);
        return;
      }

      if (data.session?.user) {
        // User successfully authenticated with Discord
        console.log('Discord authentication successful');
      }
    };

    // Check if we're in an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') || urlParams.get('access_token')) {
      handleAuthCallback();
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in with Discord:', session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setAuthError]);

  const handleDiscordSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: 'identify email'
        }
      });

      if (error) {
        console.error('Discord OAuth error:', error);
        throw error;
      }

      // OAuth will redirect, so we don't need to handle success here
    } catch (error: any) {
      console.error('Discord sign in error:', error);
      setAuthError(error.message || 'Failed to sign in with Discord');
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <MessageCircle size={24} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Dune Tracker</h2>
        <p className="text-sand-600 text-sm">
          Sign in with your Discord account to access the Deep Desert exploration network
        </p>
      </div>
      
      {authError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {authError}
        </div>
      )}
      
      <div className="space-y-4">
        <button
          onClick={handleDiscordSignIn}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Connecting to Discord...</span>
            </>
          ) : (
            <>
              <MessageCircle size={20} />
              <span>Continue with Discord</span>
              <ExternalLink size={16} />
            </>
          )}
        </button>

        <div className="text-xs text-sand-500 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield size={12} />
            <span>Secure Discord OAuth 2.0</span>
          </div>
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy.
            We only access your Discord username and email.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <User size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">New to Dune Tracker?</p>
            <p>Your account will be created automatically when you sign in with Discord. You'll be assigned a "pending" role and can start exploring immediately after admin approval.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordSignInForm; 