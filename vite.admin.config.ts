import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'admin'),
  base: '/',
  server: {
    port: 5174,
    open: '/admin/',
    proxy: {
      '/api': {
        target: 'https://ecommercepro-0ukc.onrender.com',
        changeOrigin: true,
        secure: false
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'admin', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public/admin'),
    emptyOutDir: false,
  },
});
