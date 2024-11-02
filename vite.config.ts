import { defineConfig } from 'vite';
import { resolve } from 'path';
import json from '@rollup/plugin-json';

export default defineConfig({
  plugins: [json()],
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
