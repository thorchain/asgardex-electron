/**
 * Vite config for building `main` thread sources
 *
 * Based on https://github.com/caoxiemeihao/vite-react-electron/blob/main/configs/vite.main.ts
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

export default defineConfig(({ mode }) => ({
  mode: process.env.NODE_ENV,
  envPrefix: 'REACT_APP',
  root: join(__dirname, 'src/main/'),
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), commonjsExternals({ externals: commonjsPackages })],
  build: {
    // target: `node${node}`,
    sourcemap: mode === 'development',
    outDir: '../../build',
    rollupOptions: {
      external: ['electron', 'electron-devtools-installer'],
      output: {
        entryFileNames: '[name].cjs'
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    reportCompressedSize: false,
    lib: {
      entry: 'index.ts',
      formats: ['cjs']
    },
    minify: process.env.NODE_ENV === 'production',
    emptyOutDir: true // remove prev. sources as vite.main.ts will be called first in build.mjs
  },
  optimizeDeps: {
    exclude: ['electron']
  }
}))
