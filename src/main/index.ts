import { join } from 'path'

import type { Keystore } from '@xchainjs/xchain-crypto'
import { BrowserWindow, app, ipcMain, nativeImage } from 'electron'
import electronDebug from 'electron-debug'
import isDev from 'electron-is-dev'
import log, { warn } from 'electron-log'
import windowStateKeeper from 'electron-window-state'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'

import { ipcLedgerDepositTxParamsIO, ipcLedgerSendTxParamsIO } from '../shared/api/io'
import type {
  IPCLedgerAdddressParams,
  // IPCLedgerAdddressParams,
  StoreFileName
} from '../shared/api/types'
import { DEFAULT_STORAGES } from '../shared/const'
import type { Locale } from '../shared/i18n/types'
import { registerAppCheckUpdatedHandler } from './api/appUpdate'
import { getFileStoreService } from './api/fileStore'
import { saveKeystore, removeKeystore, getKeystore, keystoreExist, exportKeystore, loadKeystore } from './api/keystore'
import {
  getAddress as getLedgerAddress,
  sendTx as sendLedgerTx,
  deposit as depositLedgerTx,
  verifyLedgerAddress
} from './api/ledger'
import IPCMessages from './ipc/messages'
import { setMenu } from './menu'

export const IS_DEV = isDev && import.meta.env.DEV
console.log('IS_DEV:', IS_DEV)

const APP_ROOT = join(__dirname, '..')

console.log('APP_ROOT:', APP_ROOT)

// // Application icon
const APP_ICON = join(APP_ROOT, 'resources', process.platform.match('win32') ? 'icon.ico' : 'icon.png')

console.log('APP_ICON:', APP_ICON)

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

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
// electronDebug({ isEnabled: true })

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let mainWindow: BrowserWindow | null = null

const initMainWindow = async () => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: IS_DEV ? 1600 : 1200,
    defaultHeight: IS_DEV ? 1000 : 800
  })

  const preload = join(APP_ROOT, 'build', 'preload.cjs')

  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    icon: nativeImage.createFromPath(APP_ICON),
    webPreferences: {
      preload
    }
  })

  const closeHandler = () => {
    mainWindow = null
  }

  mainWindowState.manage(mainWindow)
  mainWindow.on('closed', closeHandler)

  const pkg = await import('../../package.json')
  const HOST = pkg.env.HOST || '127.0.0.1'
  const PORT = pkg.env.PORT || 3000
  /**
   * URL for main window.
   * DEV: Vite dev server for development.
   * PROD: `file://../../build/renderer/index.html`
   */
  const baseUrl = IS_DEV
    ? `http://${HOST}:${PORT}`
    : new URL('./build/renderer/index.html', 'file://' + __dirname).toString()

  try {
    await mainWindow.loadURL(baseUrl)

    // hide menu at start, we need to wait for locale sent by `ipcRenderer`
    // mainWindow.setMenuBarVisibility(false)
    mainWindow.setMenuBarVisibility(true)
  } catch (e) {
    console.log('Loading baseUrl by mainWindow failed:', baseUrl, e)
  }
}

const langChangeHandler = (locale: Locale) => {
  setMenu(locale, IS_DEV)
  // show menu, which is hided at start
  if (mainWindow && !mainWindow.isMenuBarVisible()) {
    mainWindow.setMenuBarVisibility(true)
  }
}

const initIPC = () => {
  // Lang
  ipcMain.on(IPCMessages.UPDATE_LANG, (_, locale: Locale) => langChangeHandler(locale))
  // Keystore
  ipcMain.handle(IPCMessages.SAVE_KEYSTORE, (_, keystore: Keystore) => saveKeystore(keystore))
  ipcMain.handle(IPCMessages.REMOVE_KEYSTORE, () => removeKeystore())
  ipcMain.handle(IPCMessages.GET_KEYSTORE, () => getKeystore())
  ipcMain.handle(IPCMessages.KEYSTORE_EXIST, () => keystoreExist())
  ipcMain.handle(IPCMessages.EXPORT_KEYSTORE, (_, defaultFileName: string, keystore: Keystore) =>
    exportKeystore(defaultFileName, keystore)
  )
  ipcMain.handle(IPCMessages.LOAD_KEYSTORE, () => loadKeystore())
  ipcMain.handle(IPCMessages.GET_LEDGER_ADDRESS, async (_, params: IPCLedgerAdddressParams) => getLedgerAddress(params))
  ipcMain.handle(IPCMessages.VERIFY_LEDGER_ADDRESS, async (_, params: IPCLedgerAdddressParams) =>
    verifyLedgerAddress(params)
  )
  ipcMain.handle(IPCMessages.SEND_LEDGER_TX, async (_, params: unknown) => {
    return FP.pipe(
      // params need to be decoded
      ipcLedgerSendTxParamsIO.decode(params),
      E.fold((e) => Promise.reject(e), sendLedgerTx)
    )
  })
  ipcMain.handle(IPCMessages.DEPOSIT_LEDGER_TX, async (_, params: unknown) => {
    return FP.pipe(
      // params need to be decoded
      ipcLedgerDepositTxParamsIO.decode(params),
      E.fold((e) => Promise.reject(e), depositLedgerTx)
    )
  })
  // Update
  registerAppCheckUpdatedHandler(IS_DEV)
  // Register all file-stored data services
  Object.entries(DEFAULT_STORAGES).forEach(([name, defaultValue]) => {
    getFileStoreService(name as StoreFileName, defaultValue).registerIpcHandlersMain()
  })
}

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

const init = async () => {
  await app.whenReady()
  await initMainWindow()
  app.on('window-all-closed', allClosedHandler)
  app.on('activate', activateHandler)
  if (IS_DEV) {
    try {
      const { default: installExtension, REACT_DEVELOPER_TOOLS } = await import('electron-devtools-installer')
      await installExtension(REACT_DEVELOPER_TOOLS)
    } catch (e) {
      warn('unable to install devtools', e)
    }
  }
  initIPC()
}

try {
  init()
} catch (error) {
  log.error(`Unable to initial Electron app: ${error}`)
}
