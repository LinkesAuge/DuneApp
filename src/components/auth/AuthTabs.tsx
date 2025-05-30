import React from 'react';
import DiscordSignInForm from './DiscordSignInForm';

const AuthTabs: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto">
      <DiscordSignInForm />
    </div>
  );
};

export default AuthTabs;