import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true, // Da ne moraš stalno uvoziti 'describe' i 'it'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Ovo rješava tvoje @/ putanje
    },
  },
})