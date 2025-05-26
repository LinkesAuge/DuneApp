import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { User, Mail, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Import supabase client

const SignInForm: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Changed from email to identifier
  const [password, setPassword] = useState('');
  
  const authContextValue = useAuth(); // Get the whole context value
  console.log('AuthContext Value in SignInForm:', authContextValue); // Log it
  const { signIn, error: authError, setError: setAuthError, isLoading } = authContextValue; // Destructure from the logged value

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null); // Clear previous errors

    let emailToSignIn = identifier;

    if (!identifier.includes('@')) {
      // Assume it's a username, try to find the email
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', identifier) // Case-insensitive match for username
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') { // PGRST116: "Searched item was not found"
            setAuthError('Invalid username or password.');
            return;
          }
          throw profileError; // Re-throw other errors
        }

        if (profile && profile.email) {
          emailToSignIn = profile.email;
        } else {
          setAuthError('Invalid username or password.');
          return;
        }
      } catch (err: any) {
        console.error('Error fetching profile by username:', err);
        setAuthError(err.message || 'An error occurred. Please try again.');
        return;
      }
    }
    
    // Validate if emailToSignIn is a valid email format before attempting to sign in
    // This is a basic check, more robust validation can be added
    if (!emailToSignIn.includes('@')) {
        setAuthError('Invalid email format provided or derived.');
        return;
    }

    await signIn(emailToSignIn, password);
  };

  return (
    <div className="card p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      
      {authError && ( // Display authError from useAuth
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="label" htmlFor="identifier">
            Email or Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* Dynamically change icon based on input type if desired, for now Mail or User icon */}
              {identifier.includes('@') ? <Mail size={18} className="text-sand-500" /> : <User size={18} className="text-sand-500" />}
            </div>
            <input
              id="identifier"
              type="text" // Changed from email to text
              className="input pl-10"
              placeholder="you@example.com or your_username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-sand-500" />
            </div>
            <input
              id="password"
              type="password"
              className="input pl-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default SignInForm;