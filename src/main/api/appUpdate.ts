import { ipcRenderer } from 'electron'

import IPCMessages from '../ipc/messages'

const getApiAppUpdate = () => {
  return new Promise((resolve, reject) => {
    ipcRenderer.on(IPCMessages.UPDATE_AVAILABLE, (_, version, url: string) => {
      if (typeof version === 'string') {
        resolve({ version, url })
      } else {
        reject(false)
      }
    })
  })
}

export { getApiAppUpdate }
