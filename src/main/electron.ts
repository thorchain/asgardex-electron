import { join } from 'path'

import { Keystore } from '@xchainjs/xchain-crypto'
import { BrowserWindow, app, ipcMain, nativeImage } from 'electron'
import electronDebug from 'electron-debug'
// import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import { warn } from 'electron-log'

import { Locale } from '../shared/i18n/types'
import { saveKeystore, removeKeystore, getKeystore, keystoreExist } from './api/keystore'
import IPCMessages from './ipc/messages'
import { setMenu } from './menu'

export const IS_DEV = isDev && process.env.NODE_ENV !== 'production'
export const PORT = process.env.PORT || 3000

export const APP_ROOT = join(__dirname, '..', '..')

const BASE_URL_DEV = `http://localhost:${PORT}`
const BASE_URL_PROD = `file://${join(__dirname, '../build/index.html')}`
// use dev server for hot reload or file in production
export const BASE_URL = IS_DEV ? BASE_URL_DEV : BASE_URL_PROD
// Application icon
const APP_ICON = join(APP_ROOT, 'resources', process.platform.match('win32') ? 'icon.ico' : 'icon.png')

const initLogger = () => {
  log.transports.file.resolvePath = (variables: log.PathVariables) => {
    // Logs go into ~/.config/{appName}/logs/ dir
    const path = join(app.getPath('userData'), 'logs', variables.fileName as string)
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
  try {
    // Disable `REACT_DEVELOPER_TOOLS` temporary
    // It causes issues by using latest CRA 4
    // https://github.com/facebook/create-react-app/issues/9893
    // // TODO (@Veado / @ThatStrangeGuy) Bring it back once CRA 4 has been fixed
    // await installExtension(REACT_DEVELOPER_TOOLS)
  } catch (e) {
    warn('unable to install devtools', e)
  }
}

const initMainWindow = async () => {
  mainWindow = new BrowserWindow({
    width: IS_DEV ? 1600 : 1200,
    height: IS_DEV ? 1000 : 800,
    icon: nativeImage.createFromPath(APP_ICON),
    webPreferences: {
      // Disable Node.js integration
      // This recommendation is the default behavior in Electron since 5.0.0.
      // ^ https://www.electronjs.org/docs/tutorial/security#2-do-not-enable-nodejs-integration-for-remote-content
      nodeIntegration: false,
      // Context Isolation
      // ^ https://www.electronjs.org/docs/tutorial/context-isolation
      // From Electron 12, it will be enabled by default.
      contextIsolation: true,
      // Disable `remote` module
      // https://www.electronjs.org/docs/tutorial/security#15-disable-the-remote-module
      enableRemoteModule: false,
      // preload script
      preload: join(__dirname, IS_DEV ? '../../public/' : '../build/', 'preload.js')
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
  ipcMain.on(IPCMessages.UPDATE_LANG, (_, locale: Locale) => langChangeHandler(locale))
  ipcMain.handle(IPCMessages.SAVE_KEYSTORE, (_, keystore: Keystore) => saveKeystore(keystore))
  ipcMain.handle(IPCMessages.REMOVE_KEYSTORE, () => removeKeystore())
  ipcMain.handle(IPCMessages.GET_KEYSTORE, () => getKeystore())
  ipcMain.handle(IPCMessages.KEYSTORE_EXIST, () => keystoreExist())
}

const init = async () => {
  await app.whenReady()
  await initMainWindow()
  app.on('window-all-closed', allClosedHandler)
  app.on('activate', activateHandler)

  initIPC()
}

try {
  init()
} catch (error) {
  log.error(`Unable to initial Electron app: ${error}`)
}
