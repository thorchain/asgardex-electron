/**
 * Vite config for building `main` thread sources
 *
 * Based on https://github.com/caoxiemeihao/vite-react-electron/blob/main/configs/vite.main.ts
 */

import { builtinModules } from 'module'
import { join } from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/main'),
  build: {
    outDir: '../../build',
    lib: {
      entry: 'electron.ts',
      formats: ['cjs']
    },
    minify: process.env.NODE_ENV === 'production',
    emptyOutDir: true,
    rollupOptions: {
      external: [...builtinModules, 'electron'],
      output: {
        entryFileNames: '[name].cjs'
      }
    }
  }
})
