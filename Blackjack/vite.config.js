import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/BlackJack/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  test: {
    environment: 'node',
    pool: 'forks',
    include: ['src/**/__tests__/**/*.test.{js,jsx}'],
    setupFiles: ['./src/logic/__tests__/vitest-setup.js'],
  },
})
