import vite from 'vite';

export default vite.defineConfig({
  root: 'public', // Spécifie le dossier racine pour servir les fichiers
  build: {
    outDir: '../dist',
  },
});
