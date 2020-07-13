import { join } from 'path'

import { BrowserWindow, app, remote, Menu, MenuItemConstructorOptions, ipcMain } from 'electron'
import electronDebug from 'electron-debug'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import { warn } from 'electron-log'
import { createIntl, IntlShape } from 'react-intl'
import { fromEvent } from 'rxjs'

import { getLocaleFromString } from '../src/shared/i18n'
import { getMessagesByLocale, cache } from './i18n'

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
    const path = join(ap.getPath('userData'), 'logs', variables.fileName as string)
    console.log('path', path)
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
  // install react & redux chrome dev tools
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: install, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')
  try {
    await install(REACT_DEVELOPER_TOOLS)
  } catch (e) {
    warn('unable to install devtools', e)
  }
}

enum IPCMessages {
  UPDATE_LANG = 'UPDATE_LANG'
}

const menu = (intl: IntlShape): MenuItemConstructorOptions[] => [
  {
    label: intl.formatMessage({ id: 'menu.edit.title' })
  },
  {
    role: 'editMenu'
  }
]

const setMenu = (localeStr: string) => {
  console.log('electron change lang', localeStr)
  const locale = getLocaleFromString(localeStr)
  const intl = createIntl({ locale, messages: getMessagesByLocale(locale) }, cache)
  const appMenu = Menu.buildFromTemplate(menu(intl))
  Menu.setApplicationMenu(appMenu)
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
}

const init = async () => {
  app.on('ready', async () => {
    await initMainWindow()
  })

  app.on('window-all-closed', allClosedHandler)
  app.on('activate', activateHandler)
}

const initIPC = () => {
  const source$ = fromEvent<string>(ipcMain, IPCMessages.UPDATE_LANG, (_, locale) => locale)
  source$.subscribe((locale: string) => setMenu(locale))
}

try {
  init()
  initIPC()
} catch (error) {
  log.error(`Unable to initial Electron app: ${error}`)
}
