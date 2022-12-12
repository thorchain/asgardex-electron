import path from 'path'

import { ipcMain } from 'electron'
import * as fs from 'fs-extra'

import { StorageVersion, StoreFileName } from '../../shared/api/types'
import { getStoreFilesIPCMessages } from '../../shared/ipc/fileStore'
import { STORAGE_DIR } from './const'

// If `fullFilePathname' does not exist, `fs.remove` silently does nothing.
// @see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
const removeFile = async (fullFilePathname: string) => fs.remove(fullFilePathname)

const isFileExist = async (path: string) => fs.pathExists(path)

// full file path - it includes a version number, so we can ignore deprecated config files (if needed)
const getFilePath = (fileStoreName: StoreFileName, version: string) =>
  path.join(STORAGE_DIR, `${fileStoreName}-${version}.json`)

/**
 * @returns
 * 1. in case it's impossible to read from file will return Promise.resolve(defaultValue)
 * 2. in case content was read returns Promise.resolve(fileContent)
 */
export const getFileContent = async <T extends StorageVersion>(name: StoreFileName, defaultValue: T): Promise<T> => {
  const path = getFilePath(name, defaultValue.version)
  // If file does not exist create a new one with defaultValue as content
  if (!(await isFileExist(path))) {
    await fs.writeJSON(path, { ...defaultValue })
    return defaultValue
  }

  try {
    // Try to read and parse appropriate JSON store-file
    const fileContent = await fs.readJSON(path)
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
const saveToFile = async <T extends StorageVersion>(name: StoreFileName, data: Partial<T>, defaultValue: T) => {
  const path = getFilePath(name, defaultValue.version)
  const fileData = await getFileContent(name, defaultValue)
  // Combine Partial data with previously saved data
  const targetData: T = { ...fileData, ...data }
  return fs.writeJSON(path, targetData).then(() => targetData)
}

export const getFileStoreService = <T extends StorageVersion>(name: StoreFileName, defaultValue: T) => {
  const path = getFilePath(name, defaultValue.version)

  const ipcMessages = getStoreFilesIPCMessages(name)

  const registerIpcHandlersMain = () => {
    ipcMain.handle(ipcMessages.SAVE_FILE, (_, data: T) => saveToFile(name, data, defaultValue))
    ipcMain.handle(ipcMessages.REMOVE_FILE, () => removeFile(path))
    ipcMain.handle(ipcMessages.GET_FILE, () => getFileContent(name, defaultValue))
    ipcMain.handle(ipcMessages.FILE_EXIST, () => isFileExist(path))
  }

  return {
    registerIpcHandlersMain
  }
}
