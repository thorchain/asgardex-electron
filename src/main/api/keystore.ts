import * as path from 'path'

import { Keystore } from '@xchainjs/xchain-crypto'
import { dialog, ipcRenderer } from 'electron'
import * as fs from 'fs-extra'

import { ApiKeystore, IPCExportKeystoreParams, IPCSaveKeystoreParams } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'
import { STORAGE_DIR } from './const'

const getKeyFilePath = (fileName: string): string => path.join(STORAGE_DIR, `${fileName}.json`)

/**
 * Saves keystore to file system
 * Note: id === file name
 *
 * @param id Keystore id (Note: id === file name)
 * @param keystore Keystore content
 */
export const saveKeystore = async ({ id, keystore }: IPCSaveKeystoreParams) => {
  const path = getKeyFilePath(id)
  const alreadyExists = await keystoreExist(path)
  // Never override an existing keystore
  if (alreadyExists) {
    throw Error(`Keystore (id ${id} already exists - can't be overriden`)
  }
  // make sure path is valid to write keystore to it
  // https://github.com/jprichardson/node-fs-extra/blob/master/docs/ensureFile.md
  await fs.ensureFile(path)
  // write keystore into JSON file
  // https://github.com/jprichardson/node-fs-extra/blob/master/docs/writeJson.md
  return fs.writeJSON(path, keystore)
}

/**
 * Removes keystore from file system
 */
export const removeKeystore = async (id: string) => {
  const path = getKeyFilePath(id)
  // If `KEY_FILE' does not exist, `fs.remove` silently does nothing.
  // ^ see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
  return fs.remove(path)
}

/**
 * Gets keystore from file system
 *
 * @param id Keystore id (Note: id === file name)
 */
export const getKeystore = async (id: string): Promise<Keystore> => {
  const path = getKeyFilePath(id)
  return fs.readJSON(path)
}

/**
 * Checks wether keystore already exists on file system or not
 *
 * @param id Keystore id (Note: id === file name)
 */
export const keystoreExist = async (id: string): Promise<boolean> => {
  const path = getKeyFilePath(id)
  return await fs.pathExists(path)
}

/**
 * Exports existing keystore to let an user save it anywhere
 *
 * @param id Keystore id (Note: id === file name)
 * @param keystore Keystore content
 */
export const exportKeystore = async ({ fileName, keystore }: IPCExportKeystoreParams) => {
  const savePath = await dialog.showSaveDialog({
    defaultPath: fileName
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

export const KEY_FILE_PREFIX = 'keystore'
export const LEGACY_KEY_FILE = path.join(STORAGE_DIR, `${KEY_FILE_PREFIX}.json`)

export const apiKeystore: ApiKeystore = {
  save: (params: IPCSaveKeystoreParams) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE, params),
  remove: (id: string) => ipcRenderer.invoke(IPCMessages.REMOVE_KEYSTORE, id),
  get: (id: string) => ipcRenderer.invoke(IPCMessages.GET_KEYSTORE, id),
  exists: (id: string) => ipcRenderer.invoke(IPCMessages.KEYSTORE_EXIST, id),
  export: (params: IPCExportKeystoreParams) => ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, params),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE)
}
