import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  // Source uses NodeNext-style ".js" import specifiers that point at ".ts"
  // files — let Vitest resolve those to the TypeScript sources.
  resolve: {
    extensionAlias: { '.js': ['.ts', '.js'] },
  },
});
