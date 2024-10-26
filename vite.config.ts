import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  base: '/chess-game/',
  build: {
    outDir: '../dist',
    minify: 'terser', // Utilise esbuild pour minimiser le code
    sourcemap: true, // Génère une carte source pour le debugging
    rollupOptions: {
      output: {
        format: 'es', // Utilise le format ES Modules
        preserveModules: true,
        preserveModulesRoot: 'src', // Préserve la structure des modules
        entryFileNames: '[name].js', // Conserve .js dans les fichiers générés
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Alias pour src
    },
    extensions: ['.ts', '.js'], // Résoudre les extensions .ts et .js
  },
});
