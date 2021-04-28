import { ipcRenderer } from 'electron'

import IPCMessages from '../ipc/messages'

const cleanUpListeners = () => {
  ipcRenderer.removeAllListeners(IPCMessages.UPDATE_AVAILABLE)
  ipcRenderer.removeAllListeners(IPCMessages.UPDATE_NOT_AVAILABLE)
}

const getApiAppUpdate = () => {
  return new Promise<string>((resolve, reject) => {
    // based on src/main/electron.ts:SendUpdateMessage interface
    ipcRenderer.addListener(IPCMessages.UPDATE_AVAILABLE, (_, version: string) => {
      cleanUpListeners()
      resolve(version)
    })

    ipcRenderer.addListener(IPCMessages.UPDATE_NOT_AVAILABLE, (_) => {
      cleanUpListeners()
      reject()
    })
  })
}

export { getApiAppUpdate }
