import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    watch: {
      // 🌟 FIX WSL : force Vite à vérifier activement les fichiers
      // au lieu d'attendre une notification du système de fichiers,
      // qui ne remonte pas toujours correctement depuis /mnt/c/...
      usePolling: true,
      interval: 300
    }
  }
})