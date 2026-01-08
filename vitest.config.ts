import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname) },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.ts', 'tests/**/*.test.tsx', 'test/**/*.test.tsx'],
    setupFiles: [],
    hookTimeout: 120000,
  },
});