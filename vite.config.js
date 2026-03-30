import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist', // Ensure build output is placed in `dist/`
  },
  server: {
    historyApiFallback: true,
    host: true, // Listen on all local IPs (0.0.0.0)
    hmr: {
      host: '192.168.0.198', // Explicitly use your laptop's network IP
    },
    // Enables proper routing
  },
})
