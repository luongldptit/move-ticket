import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://5.181.217.137:8809',
        changeOrigin: true,
      }
    }
  }
})
