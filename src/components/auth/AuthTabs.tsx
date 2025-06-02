import React, { useState } from 'react';
import DiscordSignInForm from './DiscordSignInForm';
import SignInForm from './SignInForm';

const AuthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discord' | 'email'>('discord');

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-sand-200 mb-6">
        <button
          onClick={() => setActiveTab('discord')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'discord'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-sand-500 hover:text-sand-700 hover:border-sand-300'
          }`}
        >
          Discord
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors ${
            activeTab === 'email'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-sand-500 hover:text-sand-700 hover:border-sand-300'
          }`}
        >
          Email
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'discord' ? <DiscordSignInForm /> : <SignInForm />}

      {/* Information Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 text-center">
          {activeTab === 'discord' 
            ? 'New users must register with Discord. Existing users can use either method.'
            : 'Email login is only available for existing users. New users must register with Discord.'
          }
        </p>
      </div>
    </div>
  );
};

export default AuthTabs;