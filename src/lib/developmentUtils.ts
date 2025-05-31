// Development utilities for safe local testing with production database
export const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';
export const isLocalDev = import.meta.env.VITE_LOCAL_DEV === 'true';
export const enableDebugTools = import.meta.env.VITE_ENABLE_DEBUG_TOOLS === 'true';

// Environment indicators
export const getEnvironmentInfo = () => ({
  isDevelopment,
  isLocalDev,
  enableDebugTools,
  hostname: window.location.hostname,
  isNetlify: window.location.hostname.includes('netlify.app'),
  isLocalhost: window.location.hostname === 'localhost'
});

// Development safety checks
export const isDatabaseWriteSafe = (operation: 'delete' | 'update' | 'create') => {
  if (!isDevelopment) return true; // Production always allowed
  
  // Local development safety checks
  const userConfirmed = window.confirm(
    `🚨 LOCAL DEVELOPMENT WARNING 🚨\n\n` +
    `You're about to perform a ${operation.toUpperCase()} operation on the PRODUCTION database.\n\n` +
    `This will affect live user data!\n\n` +
    `Are you sure you want to continue?`
  );
  
  return userConfirmed;
};

// Development-only debugging
export const debugLog = (message: string, data?: any) => {
  if (enableDebugTools) {
    console.log(`🛠️ [DEV] ${message}`, data || '');
  }
};

// Visual development indicator
export const addDevelopmentIndicator = () => {
  if (!isDevelopment) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'dev-indicator';
  indicator.innerHTML = '🛠️ LOCAL DEV';
  indicator.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    background: #ff6b6b;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    z-index: 10000;
    border-bottom-left-radius: 4px;
  `;
  document.body.appendChild(indicator);
};

// Initialize development tools
if (isDevelopment && typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', addDevelopmentIndicator);
} 