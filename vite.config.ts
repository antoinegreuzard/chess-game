import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/chess-game/',
  build: {
    outDir: 'public',
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
