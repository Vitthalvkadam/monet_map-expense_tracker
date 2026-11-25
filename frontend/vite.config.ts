import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // In development, /api requests are forwarded to the Spring Boot backend
    proxy: { '/api': 'http://localhost:8080' },
  },
})
