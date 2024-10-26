import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public', // Spécifie le dossier racine pour servir les fichiers
  build: {
    outDir: '../dist',
  },
});
