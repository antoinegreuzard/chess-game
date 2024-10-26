'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// vite.config.ts
const vite_1 = require('vite');
exports.default = (0, vite_1.defineConfig)({
  root: 'public', // Spécifie le dossier racine pour servir les fichiers
  build: {
    outDir: '../dist',
  },
});
