import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { User, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp, error: authError, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs
    if (username.length < 3) {
      setFormError('Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      await signUp(email, password, username);
      // Only navigate after successful signup
      navigate('/grid');
    } catch (err: any) {
      // Don't set form error here, it will be handled by AuthProvider
      console.error('Signup error:', err);
    }
  };

  const error = formError || authError;

  // Reset form error when user starts typing after an error
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    setter(e.target.value);
  };

  return (
    <div className="card p-6 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="username">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-sand-500" />
            </div>
            <input
              id="username"
              type="text"
              className="input pl-10"
              placeholder="Choose a username"
              value={username}
              onChange={handleInputChange(setUsername)}
              required
              minLength={3}
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div>
          <label className="label" htmlFor="email">
            Email
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
              onChange={handleInputChange(setEmail)}
              required
              disabled={isLoading}
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
              type="password"
              className="input pl-10"
              placeholder="••••••••"
              value={password}
              onChange={handleInputChange(setPassword)}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <p className="mt-1 text-xs text-sand-600">
            Password must be at least 6 characters
          </p>
        </div>
        
        <button
          type="submit"
          className={`btn btn-primary w-full relative ${error ? 'opacity-75' : ''}`}
          disabled={isLoading || error !== null}
        >
          {isLoading ? (
            <>
              <span className="opacity-0">Create Account</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;