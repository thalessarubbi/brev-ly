import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/test/**'],
  clean: true,
  format: ['esm'],
  outDir: 'dist',
})
