import React, { useState } from 'react';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';

const AuthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex border-b border-sand-300 mb-6">
        <button
          className={`flex-1 py-3 font-medium text-center ${
            activeTab === 'signin'
              ? 'text-spice-600 border-b-2 border-spice-600'
              : 'text-night-500 hover:text-night-700'
          }`}
          onClick={() => setActiveTab('signin')}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-3 font-medium text-center ${
            activeTab === 'signup'
              ? 'text-spice-600 border-b-2 border-spice-600'
              : 'text-night-500 hover:text-night-700'
          }`}
          onClick={() => setActiveTab('signup')}
        >
          Create Account
        </button>
      </div>
      
      {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
    </div>
  );
};

export default AuthTabs;