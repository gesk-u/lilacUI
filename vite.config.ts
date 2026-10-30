import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // During development the Express backend (server/) answers /api
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
