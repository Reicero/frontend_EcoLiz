import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/wp-api": {
        target: "http://90.51.128.107:12443",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wp-api/, "index.php/wp-json"),
        },
    },
  },
})
