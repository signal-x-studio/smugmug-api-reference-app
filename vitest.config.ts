/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    // Include test files
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Exclude Docusaurus tests from main test run since they may have different setup
    exclude: ['docs-site/**/*', 'node_modules/**/*'],
  },
});