import { defineConfig } from 'vite'
import { resolve } from 'path'
import json from '@rollup/plugin-json'

const basePath = process.env.BASE_PATH || '/chess-game/'

export default defineConfig({
  plugins: [json()],
  base: basePath,
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
})
