/**
 * Vite config for building `renderer` thread sources
 *
 * Based on https://github.com/caoxiemeihao/vite-react-electron/blob/main/configs/vite.renderer.ts
 */
import { join } from 'path'

import react from '@vitejs/plugin-react'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import { chrome } from './.electron-vendors.cache.json'
import pkg from './package.json'

const commitHash = require('child_process').execSync('git rev-parse HEAD').toString()

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
    reportCompressedSize: false,
    chunkSizeWarningLimit: 7500, // increase value to suppress warnings - we are still in Electron land
    polyfillModulePreload: false,
    rollupOptions: {
      plugins: [nodePolyfills()]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: false // for better debugging - can be reverted to true later
  },

  resolve: {
    alias: {
      '@': join(__dirname, './src/renderer'),
      src: join(__dirname, '../src'),
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      os: 'os-browserify/browser',
      process: 'process/browser'
    }
  },
  define: {
    $COMMIT_HASH: JSON.stringify(commitHash),
    $VERSION: JSON.stringify(pkg.version)
  },
  optimizeDeps: {},
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT
  }
}))
