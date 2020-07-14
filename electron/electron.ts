import { join } from 'path'

import { BrowserWindow, app, remote, ipcMain } from 'electron'
import electronDebug from 'electron-debug'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import { warn } from 'electron-log'
import { fromEvent } from 'rxjs'

import { Locale } from '../src/shared/i18n/types'
import IPCMessages from '../src/shared/ipc/messages'
import { setMenu } from './menu'

export const IS_DEV = isDev && process.env.NODE_ENV !== 'production'

export const APP_ROOT = join(__dirname, '..', '..')

const BASE_URL_DEV = 'http://localhost:3000'
const BASE_URL_PROD = `file://${join(__dirname, '../build/index.html')}`
// use dev server for hot reload or file in production
export const BASE_URL = IS_DEV ? BASE_URL_DEV : BASE_URL_PROD

const initLogger = () => {
  log.transports.file.resolvePath = (variables: log.PathVariables) => {
    const ap = app || remote.app
    // Logs go into ~/.config/{appName}/logs/ dir
    const path = join(ap.getPath('userData'), 'logs', variables.fileName as string)
    return path
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
  // install react chrome dev tools
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: install, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
  try {
    await install(REACT_DEVELOPER_TOOLS)
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

  if (IS_DEV) {
    await setupDevEnv()
  }

  mainWindow.on('closed', closeHandler)
  mainWindow.loadURL(BASE_URL)
  // hide menu at start, we need to wait for locale sent by `ipcRenderer`
  mainWindow.setMenuBarVisibility(false)
}

const langChangeHandler = (locale: Locale) => {
  setMenu(locale, IS_DEV)
  // show menu, which is hided at start
  if (mainWindow && !mainWindow.isMenuBarVisible()) {
    mainWindow.setMenuBarVisibility(true)
  }
}

const initIPC = () => {
  const source$ = fromEvent<Locale>(ipcMain, IPCMessages.UPDATE_LANG, (_, locale) => locale)
  source$.subscribe(langChangeHandler)
}

const init = async () => {
  app.on('ready', async () => {
    await initMainWindow()
  })

  app.on('window-all-closed', allClosedHandler)
  app.on('activate', activateHandler)

  initIPC()
}

try {
  init()
} catch (error) {
  log.error(`Unable to initial Electron app: ${error}`)
}
