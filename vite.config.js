import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  server: {
    port: 3001,
    allowedHosts: ['2dcc-2806-230-500e-cd5a-d9af-c9d2-c0fc-38d8.ngrok-free.app']
  },
})
