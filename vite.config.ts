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
    chunkSizeWarningLimit: 1600, // Increase chunk size warning limit to 1.6MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'react-hot-toast', 'sonner'],
          image: ['react-image-crop', 'react-zoom-pan-pinch'],
        }
      }
    }
  },
  server: {
    hmr: {
      // Disable HMR console logs
      overlay: false
    },
    host: true,
    port: 5173
  },
  logLevel: 'warn' // Only show warnings and errors, not info messages
});