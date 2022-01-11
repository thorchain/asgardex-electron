/**
 * Vite config for building `preload` part
 *
 * Based on https://github.com/caoxiemeihao/vite-react-electron/blob/main/configs/vite.preload.ts
 */

import { builtinModules } from 'module'
import { join } from 'path'

import escapeRegExp from 'lodash.escaperegexp'
import { defineConfig } from 'vite'
import commonjsExternals from 'vite-plugin-commonjs-externals'
import tsconfigPaths from 'vite-tsconfig-paths'

import pkg from './package.json'
// import { node } from './.electron-vendors.cache.json'

const commonjsPackages = [
  'electron',
  ...builtinModules,
  ...Object.keys(pkg.dependencies).map((name) => new RegExp('^' + escapeRegExp(name) + '(\\/.+)?$'))
]

export default defineConfig({
  mode: process.env.NODE_ENV,
  envPrefix: 'REACT_APP',
  root: join(__dirname, 'src/main'),
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.preload.json'] }),
    commonjsExternals({ externals: commonjsPackages })
  ],
  build: {
    // target: `node${node}`,
    outDir: '../../build',
    lib: {
      entry: 'preload.ts',
      formats: ['cjs']
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: process.env.NODE_ENV === 'production',
    emptyOutDir: false, // don't delete files from `main` build, which is running before
    rollupOptions: {
      external: ['electron', ...builtinModules],
      output: {
        entryFileNames: '[name].cjs'
      }
    }
  },
  optimizeDeps: {
    exclude: ['electron']
  }
})
