/**
 * Vite config for building `renderer` thread sources
 *
 * Based on https://github.com/caoxiemeihao/vite-react-electron/blob/main/configs/vite.renderer.ts
 */
import { join } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'

import pkg from '../package.json'

// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: join(__dirname, '../src/renderer'),
  plugins: [
    react(),
    svgrPlugin({
      // https://react-svgr.com/docs/options/
      svgrOptions: {
        icon: true
      }
    })
  ],
  base: './',
  build: {
    emptyOutDir: true,
    outDir: '../../build'
  },
  resolve: {
    alias: {
      '@': join(__dirname, '../src/renderer'),
      src: join(__dirname, '../src'),
      process: 'process/browser',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      os: 'os-browserify/browser'
    }
  },
  server: {
    host: pkg.env.HOST,
    port: pkg.env.PORT
  }
})
