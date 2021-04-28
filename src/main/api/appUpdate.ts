import { ipcRenderer } from 'electron'

import IPCMessages from '../ipc/messages'

const cleanUpListeners = () => {
  ipcRenderer.removeAllListeners(IPCMessages.UPDATE_AVAILABLE)
  ipcRenderer.removeAllListeners(IPCMessages.UPDATE_NOT_AVAILABLE)
}

const getApiAppUpdate = () => {
  return new Promise((resolve, reject) => {
    // based on src/main/electron.ts:SendUpdateMessage interface
    ipcRenderer.addListener(IPCMessages.UPDATE_AVAILABLE, (_, version: string, url: string) => {
      cleanUpListeners()
      resolve({ version, url })
    })

    ipcRenderer.addListener(IPCMessages.UPDATE_NOT_AVAILABLE, (_) => {
      cleanUpListeners()
      reject()
    })
  })
}

export { getApiAppUpdate }
