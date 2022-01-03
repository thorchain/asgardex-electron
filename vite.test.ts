/// <reference types="vitest" />

import { builtinModules } from 'module'
import { join } from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

import pkg from './package.json'

const commitHash = require('child_process').execSync('git rev-parse HEAD').toString()

console.log('commitHash:', commitHash)

// https://vitejs.dev/config/
export default defineConfig(() => ({
  test: {
    root: './src',
    global: true,
    // include: ['src/**/*.test.ts*'],
    include: [
      'src/**/*.test.ts*'
      // 'src/renderer/helpers/poolHelper.test.ts'
    ],
    environment: 'happy-dom',
    deps: {
      inline: ['@ethersproject', 'moment', '@ant-design/react-slick', 'compute-scroll-into-view']
    },

    setupFiles: ['./src/test/setupTest.ts']
  },
  mode: process.env.NODE_ENV,
  envPrefix: 'REACT_APP',
  root: join(__dirname, 'src'),
  plugins: [tsconfigPaths({ projects: ['./tsconfig.test.json'] }), react(), svgrPlugin()],
  base: './',
  build: {
    rollupOptions: {
      external: [...builtinModules],
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
  }
}))
