import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', ['text', { file: 'coverage.txt' }]],
      include: ['src/**/*.js'],
      all: true,
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    reporters: ['verbose'],
  },
});
