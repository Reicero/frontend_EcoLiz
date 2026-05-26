import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for EcoLiz frontend
 * 
 * Development:
 * - Hot Module Reload (HMR) enabled
 * - Proxy configured for /wp-api/* → WordPress API
 * - Uses VITE_DEV_PROXY_TARGET or defaults to localhost:8000
 * 
 * Production:
 * - Optimized bundle
 * - No proxy (uses relative paths /wp-api/*)
 */
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/wp-api': {
        // Proxy target can be overridden via VITE_DEV_PROXY_TARGET env var
        // Default: http://localhost:8000 (for local WordPress development)
        // Can be: http://90.51.128.107:12443 (VM development)
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wp-api/, 'index.php/wp-json'),
      },
    },
  },
})
