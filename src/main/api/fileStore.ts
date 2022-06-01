import path from 'path'

import { ipcRenderer, ipcMain } from 'electron'
import * as fs from 'fs-extra'

import { ApiFileStoreService, StorageVersion, StoreFileData, StoreFileName } from '../../shared/api/types'
import { getStoreFilesIPCMessages } from '../../shared/ipc/fileStore'
import { STORAGE_DIR } from './const'

// If `fullFilePathname' does not exist, `fs.remove` silently does nothing.
// @see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
const removeFile = async (fullFilePathname: string) => fs.remove(fullFilePathname)

const isFileExist = async (fullFilePathname: string) => fs.pathExists(fullFilePathname)

/**
 * @returns
 * 1. in case it's impossible to read from file will return Promise.resolve(defaultValue)
 * 2. in case content was read returns Promise.resolve(fileContent)
 */
const getFileContent = async <T>(fullFilePathname: string, defaultValue: T): Promise<T> => {
  // If wile does not exist create a new one with defaultValue as content
  if (!(await isFileExist(fullFilePathname))) {
    await fs.writeJSON(fullFilePathname, { ...defaultValue })
    return defaultValue
  }

  try {
    // Try to read and parse appropriate JSON store-file
    const fileContent = await fs.readJSON(fullFilePathname)
    // Combine file content with provided default value
    return { ...defaultValue, ...fileContent }
  } catch {
    // Resolve with default value in case of any error
    return defaultValue
  }
}
/**
 * Saves combined store-file's content with partial provided data to the file.
 * Will return rejected Promise in case if fs.writeJSON was failed to write to the file
 *
 * @returns
 * 1. in case content was written: Promise.resolve(composedContent)
 * 2. in case there was any issue while writing: Promise.reject
 */
const saveToFile = async <T>(fullFilePathname: string, data: Partial<T>, defaultValue: T) => {
  const fileData = await getFileContent(fullFilePathname, defaultValue)
  // Combine Partial data with previously saved data
  const targetData: T = { ...fileData, ...data }
  return fs.writeJSON(fullFilePathname, targetData).then(() => targetData)
}

export const getFileStoreService = <T extends StorageVersion>(fileStoreName: StoreFileName, defaultValue: T) => {
  // full file path to save - it includes a version number, so we can ignore deprecated config files (if needed)
  const fullFilePathname = path.join(STORAGE_DIR, `${fileStoreName}-${defaultValue.version}.json`)

  const ipcMessages = getStoreFilesIPCMessages(fileStoreName)

  const registerIpcHandlersMain = () => {
    ipcMain.handle(ipcMessages.SAVE_FILE, (_, data: T) => saveToFile(fullFilePathname, data, defaultValue))
    ipcMain.handle(ipcMessages.REMOVE_FILE, () => removeFile(fullFilePathname))
    ipcMain.handle(ipcMessages.GET_FILE, () => getFileContent(fullFilePathname, defaultValue))
    ipcMain.handle(ipcMessages.FILE_EXIST, () => isFileExist(fullFilePathname))
  }

  return {
    registerIpcHandlersMain
  }
}

/**
 * Provides real-world-to-electron public API  for
 * declared STORE_FILES_DEFAULTS (src/shared/const.ts) only
 */
export const getFileStoreApi = <FileName extends StoreFileName>(
  storeFileName: FileName
): ApiFileStoreService<StoreFileData<FileName>> => {
  const ipcMessages = getStoreFilesIPCMessages(storeFileName)
  return {
    save: (data) => ipcRenderer.invoke(ipcMessages.SAVE_FILE, data),
    remove: () => ipcRenderer.invoke(ipcMessages.REMOVE_FILE),
    get: () => ipcRenderer.invoke(ipcMessages.GET_FILE),
    exists: () => ipcRenderer.invoke(ipcMessages.FILE_EXIST)
  }
}
