import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@/shared': resolve(__dirname, './src/shared'),
      '@/features': resolve(__dirname, './src/features'),
      // Matches tsconfig's "@/app/*": ["./src/app/*"].
      '@/app': resolve(__dirname, './src/app'),
      // Matches tsconfig's "@/*": ["./src/*"].
      '@': resolve(__dirname, './src'),
    },
  },
})
