import * as RD from '@devexperts/remote-data-ts'
import { ipcMain } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import * as O from 'fp-ts/Option'

import { AppUpdateRD } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const registerAppCheckUpdatedHandler = (isDev = false) => {
  // Disable autoDownload
  autoUpdater.autoDownload = false
  autoUpdater.allowPrerelease = false

  if (isDev) {
    autoUpdater.logger = {
      ...log,
      // Set custom info logger for better understanding in common debug-flow
      info(message?: unknown): void {
        console.log('[AutoUpdater.info]', message)
      }
    }
  }

  ipcMain.handle(IPCMessages.APP_CHECK_FOR_UPDATE, (): Promise<AppUpdateRD> => {
    const cleanListeners = () => {
      autoUpdater.removeAllListeners('update-available')
      autoUpdater.removeAllListeners('update-not-available')
    }

    return new Promise((resolve) => {
      autoUpdater.once('update-available', (info: { version: string }) => {
        resolve(RD.success(O.some(info.version)))
      })

      autoUpdater.once('update-not-available', () => {
        resolve(RD.success(O.none))
      })

      autoUpdater
        .checkForUpdates()
        .catch((e) => {
          cleanListeners()
          resolve(RD.failure(e))
        })
        .then((value) => {
          cleanListeners()
          return value
        })
    })
  })
}
