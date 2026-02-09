import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', ['text', { file: 'coverage.txt' }]],
      include: ['src/**/*.js'],
      all: true,
      // Fuzz tests don't cover all code paths (e.g., error handling),
      // so we don't enforce 100% coverage thresholds
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
    reporters: ['verbose'],
  },
});
