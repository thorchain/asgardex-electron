import * as RD from '@devexperts/remote-data-ts'
import { ipcRenderer, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

import { AppUpdateRD } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const registerAppCheckUpdatedHandler = () => {
  ipcMain.handle(
    IPCMessages.APP_CHECK_FOR_UPDATE,
    (): Promise<AppUpdateRD> => {
      const cleanListeners = () => {
        autoUpdater.removeAllListeners('update-available')
        autoUpdater.removeAllListeners('update-not-available')
      }

      return new Promise((resolve) => {
        autoUpdater.once('update-available', (info: { version: string }) => {
          resolve(RD.success(info.version))
        })

        autoUpdater.once('update-not-available', () => {
          resolve(RD.initial)
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
    }
  )
}

export const checkForAppUpdates = (): Promise<AppUpdateRD> => {
  return ipcRenderer.invoke(IPCMessages.APP_CHECK_FOR_UPDATE)
}

export const apiAppUpdate = {
  checkForAppUpdates
}
