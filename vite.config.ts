import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'docs', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 },
  server: { port: 5183, open: true },
});
