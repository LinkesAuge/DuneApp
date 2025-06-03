import React from 'react'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Suppress React DevTools download message in development
if (process.env.NODE_ENV === 'development') {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools')) {
      // Suppress React DevTools download message
      return;
    }
    originalConsoleLog.apply(console, args);
  };
}

// Initialize development utilities
import './lib/developmentUtils';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);