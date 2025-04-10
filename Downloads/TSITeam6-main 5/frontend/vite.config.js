import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: '/src/index.jsx', // Ensure Vite loads `index.js` instead of `main.jsx`
    }
  }
});
