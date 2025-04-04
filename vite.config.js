import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist', // Ensure build output is placed in `dist/`
  },
  server: {
    historyApiFallback: true, // Enables proper routing
  },
})
