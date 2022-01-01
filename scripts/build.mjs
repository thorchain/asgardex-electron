process.env.NODE_ENV = 'production'

import chalk from 'chalk'
import { build as viteBuild } from 'vite'

const TAG = chalk.bgBlue('[build.mjs]')

const viteConfigs = {
  main: './vite.main.ts',
  preload: './vite.preload.ts',
  renderer: './vite.renderer.ts'
}

async function buildElectron() {
  for (const [name, configPath] of Object.entries(viteConfigs)) {
    console.group(TAG, name)
    await viteBuild({
      configFile: configPath,
      mode: process.env.NODE_ENV
    })
    console.groupEnd()
    console.log() // for beautiful log.
  }
}

// bootstrap
await buildElectron()
