/**
 * Vite config for building `renderer` thread sources
 *
 * Based on https://github.com/caoxiemeihao/vite-react-electron/blob/main/configs/vite.renderer.ts
 */
import { builtinModules } from 'module'
import { join } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { chrome } from './.electron-vendors.cache.json'
import pkg from './package.json'

const commitHash = require('child_process').execSync('git rev-parse HEAD').toString()

console.log('commitHash:', commitHash)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  mode: process.env.NODE_ENV,
  envPrefix: 'REACT_APP',
  root: join(__dirname, 'src', 'renderer'),
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), react(), svgrPlugin()],
  base: './',
  build: {
    target: `chrome${chrome}`,
    sourcemap: mode === 'development',
    emptyOutDir: true,
    outDir: '../../build/renderer',
    rollupOptions: {
      external: [...builtinModules],
      output: {
        entryFileNames: '[name].cjs'
      }
    },
    reportCompressedSize: false
  },
  resolve: {
    alias: {
      '@': join(__dirname, './src/renderer'),
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      os: 'os-browserify/browser'
    }
  },
  define: {
    $COMMIT_HASH: JSON.stringify(commitHash),
    $VERSION: JSON.stringify(pkg.version)
  },
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT
  }
}))
