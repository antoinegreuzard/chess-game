import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/chess-game/',
  build: {
    outDir: 'dist',
    minify: false,
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // Force l’inclusion de tous les imports dynamiques dans un seul fichier
        entryFileNames: 'bundle.js', // Spécifie le nom du fichier final
        chunkFileNames: undefined, // Empêche la création de chunks additionnels
        assetFileNames: '[name].[ext]',
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
