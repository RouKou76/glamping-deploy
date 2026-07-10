import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['apps/*/src/**/*.test.{ts,tsx}'],
  },
})
