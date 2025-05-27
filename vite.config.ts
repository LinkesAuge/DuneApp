import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
  base: '/',
  build: {
    sourcemap: false // Disable source maps in build
  },
  server: {
    hmr: {
      // Disable HMR console logs
      overlay: false
    }
  },
  logLevel: 'warn' // Only show warnings and errors, not info messages
});