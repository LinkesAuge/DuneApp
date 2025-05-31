// Authentication configuration for different environments
import { isDevelopment, debugLog } from './developmentUtils';

export interface AuthConfig {
  enableEmailAuth: boolean;
  enableDiscordAuth: boolean;
  requireDiscordOnly: boolean;
  allowUserRegistration: boolean;
  enableGuestMode: boolean;
}

// Get auth configuration based on environment
export const getAuthConfig = (): AuthConfig => {
  const config = {
    // Production settings (current state)
    enableEmailAuth: true,
    enableDiscordAuth: true,
    requireDiscordOnly: false,
    allowUserRegistration: true,
    enableGuestMode: false,
  };

  // Development overrides for testing Discord-only migration
  if (isDevelopment) {
    const testDiscordOnly = import.meta.env.VITE_TEST_DISCORD_ONLY === 'true';
    
    if (testDiscordOnly) {
      config.enableEmailAuth = false;
      config.requireDiscordOnly = true;
      debugLog('Discord-only authentication mode enabled for testing');
    }
  }

  return config;
};

// Helper functions for auth state
export const shouldShowEmailAuth = () => {
  const config = getAuthConfig();
  return config.enableEmailAuth && !config.requireDiscordOnly;
};

export const shouldShowDiscordAuth = () => {
  const config = getAuthConfig();
  return config.enableDiscordAuth;
};

export const isDiscordRequired = () => {
  const config = getAuthConfig();
  return config.requireDiscordOnly;
};

export const canRegisterNewUsers = () => {
  const config = getAuthConfig();
  return config.allowUserRegistration;
};

// Discord-only migration helpers
export const getRedirectUrl = () => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/auth/callback`;
};

export const getDiscordOAuthUrl = () => {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(getRedirectUrl());
  
  return `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify email`;
}; 