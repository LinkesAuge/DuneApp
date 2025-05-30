import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
  base: '/',
  build: {
    sourcemap: false, // Disable source maps in build
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries into their own chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'react-zoom-pan-pinch', 'react-image-crop'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    hmr: {
      // Disable HMR console logs
      overlay: false
    }
  },
  logLevel: 'warn' // Only show warnings and errors, not info messages
});