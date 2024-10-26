import { defineConfig } from 'vite';
import { resolve } from 'path';
export default defineConfig({
    root: 'public',
    base: '/chess-game/', // Base URL pour GitHub Pages
    build: {
        outDir: '../dist',
        rollupOptions: {
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
                preserveModules: true,
                format: 'esm',
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
        extensions: ['.ts', '.js'],
    },
});
