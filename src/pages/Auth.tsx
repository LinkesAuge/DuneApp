import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import AuthTabs from '../components/auth/AuthTabs';

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Only redirect if we have a user and we're not loading
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-night-950 mb-2">Welcome to Dune Tracker</h1>
          <p className="text-night-700">
            Sign in or create an account to start exploring the deep desert
          </p>
        </div>
        
        {isLoading ? (
          <div className="card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600 mx-auto"></div>
            <p className="mt-4 text-night-600">Authenticating...</p>
          </div>
        ) : (
          <AuthTabs />
        )}
        
        <p className="mt-8 text-center text-sm text-night-600">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;