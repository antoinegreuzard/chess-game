import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './public',
  base: '/chess-game/',
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.ts', '.js'],
  },
});
