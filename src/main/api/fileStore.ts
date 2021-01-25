import path from 'path'

import { app, ipcRenderer, ipcMain } from 'electron'
import * as fs from 'fs-extra'

import { ApiFileStoreService, StoreFileData, StoreFileName } from '../../shared/api/types'
import { getStoreFilesIPCMessages } from '../../shared/ipc/fileStore'

const APP_NAME = app?.name ?? 'ASGARDEX'

const APP_DATA_DIR = path.join(app?.getPath('appData') ?? './testdata', APP_NAME)
export const STORAGE_DIR = path.join(APP_DATA_DIR, 'storage')

// If `fullFilePathname' does not exist, `fs.remove` silently does nothing.
// @see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
const removeFile = async (fullFilePathname: string) => fs.remove(fullFilePathname)

const isFileExist = async (fullFilePathname: string) => fs.pathExists(fullFilePathname)

const getFileContent = async <T>(fullFilePathname: string, defaultValue: T): Promise<T> => {
  // If wile does not exist create a new one with defaultValue as content
  if (!(await isFileExist(fullFilePathname))) {
    await fs.writeJSON(fullFilePathname, { ...defaultValue })
    return Promise.resolve(defaultValue)
  }

  try {
    // Try to read and parse appropriate JSON store-file
    const fileContent = await fs.readJSON(fullFilePathname)
    // Combine file content with provided default value
    return Promise.resolve({ ...defaultValue, ...fileContent })
  } catch {
    // Resolve with default value in case of any error
    return Promise.resolve(defaultValue)
  }
}
/**
 * Replaces store-file's content with partial provided data
 */
const saveFile = async <T>(fullFilePathname: string, data: Partial<T>, defaultValue: T) => {
  const fileData = await getFileContent(fullFilePathname, defaultValue)
  // Combine Partial data with previously saved data
  await fs.writeJSON(fullFilePathname, { ...fileData, ...data })
  return await getFileContent(fullFilePathname, defaultValue)
}

export const getFileStoreService = <T extends object>(fileStoreName: StoreFileName, defaultValue: T) => {
  // full file path to save
  const fullFilePathname = path.join(STORAGE_DIR, `${fileStoreName}.json`)

  const ipcMessages = getStoreFilesIPCMessages(fileStoreName)

  const registerIpcHandlersMain = () => {
    ipcMain.handle(ipcMessages.SAVE_FILE, (_, data: T) => saveFile(fullFilePathname, data, defaultValue))
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
