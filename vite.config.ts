import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/scenes': resolve(__dirname, 'src/scenes'),
      '@/ui': resolve(__dirname, 'src/ui'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/managers': resolve(__dirname, 'src/managers'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/services': resolve(__dirname, 'src/services'),
      '@/config': resolve(__dirname, 'src/config')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
})