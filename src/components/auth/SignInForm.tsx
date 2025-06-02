import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const SignInForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, error: authError, setError: setAuthError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (error) {
      // Error is already handled in the signIn method
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-6 w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Mail size={24} className="text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Sign In with Email</h2>
        <p className="text-sand-600 text-sm">
          Access your account using your email and password
        </p>
      </div>
      
      {authError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-sand-500" />
            </div>
            <input
              id="email"
              type="email"
              className="input pl-10"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-sand-500" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input pl-10 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-sand-500 hover:text-sand-700" />
              ) : (
                <Eye size={18} className="text-sand-500 hover:text-sand-700" />
              )}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <Mail size={20} />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-amber-50 rounded-lg">
        <div className="text-xs text-amber-800 text-center">
          <p className="font-medium mb-1">Email login is for existing users only</p>
          <p>New users must register with Discord. If you don't have an account, please use the Discord tab to create one.</p>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;