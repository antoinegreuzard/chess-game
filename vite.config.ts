import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/chess-game/',
  build: {
    outDir: 'public',
    minify: 'esbuild', // Utilise esbuild pour minimiser le code
    sourcemap: true, // Génère une carte source pour le debugging
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Alias pour src
    },
    extensions: ['.ts', '.js'], // Résoudre les extensions .ts et .js
  },
});
