import * as path from 'path'

import { Keystore } from '@xchainjs/xchain-crypto'
import { dialog, ipcRenderer } from 'electron'
import * as fs from 'fs-extra'

import { ApiKeystore } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'
import { STORAGE_DIR } from './const'

// key file path
export const KEY_FILE = path.join(STORAGE_DIR, 'keystore.json')

export const saveKeystore = async (keystore: Keystore) => {
  await fs.ensureFile(KEY_FILE)
  return fs.writeJSON(KEY_FILE, keystore)
}

// If `KEY_FILE' does not exist, `fs.remove` silently does nothing.
// ^ see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
export const removeKeystore = async () => fs.remove(KEY_FILE)
export const getKeystore = async () => fs.readJSON(KEY_FILE)
export const keystoreExist = async () => fs.pathExists(KEY_FILE)

export const exportKeystore = async (defaultFileName: string, keystore: Keystore) => {
  const savePath = await dialog.showSaveDialog({
    defaultPath: defaultFileName
  })
  if (!savePath.canceled && savePath.filePath) {
    await fs.ensureFile(savePath.filePath)
    return fs.writeJSON(savePath.filePath, keystore)
  }
}

export const loadKeystore = async () => {
  try {
    const filePath = await dialog.showOpenDialog({})
    if (!filePath.canceled) {
      return await fs.readJSON(filePath.filePaths[0])
    }
  } catch (err) {
    return Promise.reject(err)
  }
}

export const apiKeystore: ApiKeystore = {
  save: (keystore: Keystore) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE, keystore),
  remove: () => ipcRenderer.invoke(IPCMessages.REMOVE_KEYSTORE, KEY_FILE),
  get: () => ipcRenderer.invoke(IPCMessages.GET_KEYSTORE, KEY_FILE),
  exists: () => ipcRenderer.invoke(IPCMessages.KEYSTORE_EXIST),
  export: (defaultFileName: string, keystore: Keystore) =>
    ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, defaultFileName, keystore),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE)
}
