import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/chess-game/',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        format: 'es',
      },
    },
  },
  worker: {
    format: 'es',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
});
