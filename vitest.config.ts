import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    env: {
      NODE_ENV: 'test',
    },
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules/**', 'legacy/**', 'lovable-ref/**'],
  },
});
