import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import React from 'react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxFactory: React.createElement,
    jsxInject: false,
  },
  server: {
    port: 5124,
    // Proxy API calls to the Express backend running on port 5123.
    // This avoids CORS issues and lets the frontend call `/api/...`.
    proxy: {
      '/api': {
        target: 'http://localhost:5123',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
