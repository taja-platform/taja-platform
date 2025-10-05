import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from the .env files
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Use VITE_PORT from .env only in development mode
      port: mode === 'development' ? Number(env.VITE_PORT) || 5050 : 5173,
      open: true,
    },
  }
})
