import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import AuthTabs from '../components/auth/AuthTabs';
import DiamondIcon from '../components/common/DiamondIcon';
import { Shield, User, Lock } from 'lucide-react';

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from the location state, or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Only redirect if we have a user and we're not loading
  if (user && !isLoading) {
    console.log('User authenticated, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Multi-layer background system */}
      <div className="fixed inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900/90 via-slate-800/60 to-slate-900/90" />
      
      {/* Advanced purple overlay pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-violet-800/10" />
      
      {/* Subtle radial gradient for depth */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.04) 40%, transparent 70%)`
        }}
      />
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header section with DiamondIcon */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <DiamondIcon
                icon={<Shield size={24} strokeWidth={1.5} />}
                size="xl"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={2}
                iconColor="text-gold-300"
              />
            </div>
            
            <h1 className="text-4xl font-light tracking-[0.3em] text-amber-200 mb-4"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              DUNE TRACKER
            </h1>
            <h2 className="text-xl font-thin tracking-[0.1em] text-amber-300/80 mb-6"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              ACCESS PORTAL
            </h2>
            <p className="text-amber-300/70 font-light tracking-wide">
              Authenticate to access the Deep Desert exploration network
            </p>
          </div>
          
          {/* Auth form container */}
          <div className="group relative">
            {/* Multi-layer background for auth container */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
            
            {/* Interactive overlay */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out bg-gradient-to-b from-violet-600/5 via-violet-700/3 to-transparent" />
            
            {/* Content */}
            <div className="relative p-8 rounded-lg border border-amber-400/20 hover:border-amber-300/30 transition-all duration-500">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-6">
                    <DiamondIcon
                      icon={<User size={20} strokeWidth={1.5} />}
                      size="lg"
                      bgColor="bg-void-950"
                      actualBorderColor="bg-gold-300"
                      borderThickness={2}
                      iconColor="text-gold-300"
                      className="animate-pulse"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-400/20 via-amber-300/40 to-amber-400/20 mx-auto rounded-full animate-pulse" />
                    <p className="text-amber-300/80 font-light tracking-wide">
                      Authenticating neural interface...
                    </p>
                  </div>
                </div>
              ) : (
                <AuthTabs />
              )}
            </div>
          </div>
          
          {/* Security info */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <DiamondIcon
                icon={<Lock size={12} strokeWidth={1.5} />}
                size="xs"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={1}
                iconColor="text-gold-300"
              />
              <p className="text-xs font-light tracking-widest text-amber-300/60 uppercase"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Secure Connection
              </p>
            </div>
            <p className="text-xs text-amber-300/50 font-thin tracking-wide">
              By accessing this system, you agree to the Terms of Service and Privacy Policy.
              All transmissions are encrypted and monitored for security.
            </p>
          </div>
        </div>
        
        {/* Footer branding */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <p className="text-xs font-light tracking-[0.2em] text-amber-300/40 uppercase"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Deep Desert • Exploration Network • Ver 2.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;