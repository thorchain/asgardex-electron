import * as path from 'path'

import { Keystore } from '@xchainjs/xchain-crypto'
import { ipcRenderer } from 'electron'
import { app } from 'electron'
import * as fs from 'fs-extra'

import { ApiKeystore } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

const APP_NAME = app?.name ?? 'ASGARDEX'

const APP_DATA_DIR = path.join(app?.getPath('appData') ?? './testdata', APP_NAME)
export const STORAGE_DIR = path.join(APP_DATA_DIR, 'storage')

export const saveKeystore = async (keystore: Keystore) => {
  await fs.ensureFile(KEY_FILE)
  return fs.writeJSON(KEY_FILE, keystore)
}

// If `KEY_FILE' does not exist, `fs.remove` silently does nothing.
// ^ see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
export const removeKeystore = async () => fs.remove(KEY_FILE)
export const getKeystore = async () => fs.readJSON(KEY_FILE)
export const keystoreExist = async () => fs.pathExists(KEY_FILE)

// key file path
export const KEY_FILE = path.join(STORAGE_DIR, 'keystore.json')

export const apiKeystore: ApiKeystore = {
  save: (keystore: Keystore) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE, keystore),
  remove: () => ipcRenderer.invoke(IPCMessages.REMOVE_KEYSTORE, KEY_FILE),
  get: () => ipcRenderer.invoke(IPCMessages.GET_KEYSTORE, KEY_FILE),
  exists: () => ipcRenderer.invoke(IPCMessages.KEYSTORE_EXIST)
}
