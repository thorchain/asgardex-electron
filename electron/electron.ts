import electronDebug from 'electron-debug'
import log from 'electron-log'
import { BrowserWindow, app, remote } from 'electron'
import { join } from 'path'
import { warn } from 'electron-log'

import isDev from 'electron-is-dev'

export const IS_DEV = isDev && process.env.NODE_ENV !== 'production'
export const APP_ROOT = join(__dirname, '..', '..')

const BASE_URL_DEV = 'http://localhost:3000'
const BASE_URL_PROD = `file://${join(__dirname, '../build/index.html')}`
// use dev server for hot reload or file in production
export const BASE_URL = IS_DEV ? BASE_URL_DEV : BASE_URL_PROD

const initLogger = () => {
  log.transports.file.resolvePath = (variables: log.PathVariables) => {
    const ap = app || remote.app
    // Logs go into ~/.{appName}/logs/ dir
    return join(ap.getPath('userData'), app.getName(), 'logs', variables.fileName as string)
  }
}

// set global configuration for logging
initLogger()

// disable the Electron Security Warnings shown when access the dev url
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = `${IS_DEV}`

log.debug(`Starting Electron main process`)

// Enable keyboard shortcuts and optionally activate DevTools on each created `BrowserWindow`.
electronDebug({ isEnabled: IS_DEV })

let mainWindow: BrowserWindow | null = null

const activateHandler = () => {
  if (mainWindow === null) {
    initMainWindow()
  }
}

const allClosedHandler = () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}

const closeHandler = () => {
  mainWindow = null
}

const setupDevEnv = async () => {
  // install react & redux chrome dev tools
  const { default: install, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer') // eslint-disable-line @typescript-eslint/no-var-requires
  try {
    await install(REACT_DEVELOPER_TOOLS)
    await install(REDUX_DEVTOOLS)
  } catch (e) {
    warn('unable to install devtools', e)
  }
}

const initMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: IS_DEV ? 1600 : 1200,
    height: IS_DEV ? 1000 : 800,
    icon: join(APP_ROOT, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.setMenuBarVisibility(false)

  if (IS_DEV) {
    await setupDevEnv()
  }

  mainWindow.on('closed', closeHandler)
  mainWindow.loadURL(BASE_URL)
}

const init = async () => {
  app.on('ready', async () => {
    await initMainWindow()
  })

  app.on('window-all-closed', allClosedHandler)
  app.on('activate', activateHandler)
}

try {
  init()
} catch (error) {
  log.error(`Unable to initial Electron app: ${error}`)
}
