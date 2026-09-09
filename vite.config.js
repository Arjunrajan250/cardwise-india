import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/data/cards.js') || id.includes('/src/data/loans.js')) {
            return 'data-catalog';
          }
        }
      }
    }
  }
});
