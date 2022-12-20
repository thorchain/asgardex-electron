import { contextBridge } from 'electron'
import { ipcRenderer } from 'electron'

import type {
  ApiFileStoreService,
  ApiKeystore,
  AppUpdateRD,
  IPCExportKeystoreParams,
  StoreFileData,
  StoreFileName
} from '../shared/api/types'
import { getStoreFilesIPCMessages } from '../shared/ipc/fileStore'
import { apiHDWallet } from './api/hdwallet'
import { apiLang } from './api/lang'
import { apiUrl } from './api/url'
import IPCMessages from './ipc/messages'

// ContextBridge is used here to expose custom api objects on `window`
// to be accessable at `renderer` processes,
// even if `contextIsolation` is enabled
// https://www.electronjs.org/docs/api/context-bridge

/**
 * When exposing anything to the real world do not forget to
 * declare appropriate types for global Window interface
 * at the src/shared/api/types.ts
 */
//
// `apiKeystore` object
//
const apiKeystore: ApiKeystore = {
  // Note: `params` need to be encoded by `ipcKeystoreWalletsIO` before calling `saveKeystoreWallets` */
  saveKeystoreWallets: (params: unknown) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE_WALLETS, params),
  exportKeystore: (params: IPCExportKeystoreParams) => ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, params),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE),
  initKeystoreWallets: () => ipcRenderer.invoke(IPCMessages.INIT_KEYSTORE_WALLETS)
}
contextBridge.exposeInMainWorld('apiKeystore', apiKeystore)

//
// `apiLang` object
//
contextBridge.exposeInMainWorld('apiLang', apiLang)

//
// `apiUrl` object
//
contextBridge.exposeInMainWorld('apiUrl', apiUrl)

//
// `apiHDWallet` object
//
contextBridge.exposeInMainWorld('apiHDWallet', apiHDWallet)

//
// api for storage objects
//
const getFileStoreApi = <FileName extends StoreFileName>(
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
contextBridge.exposeInMainWorld('apiCommonStorage', getFileStoreApi('common'))
contextBridge.exposeInMainWorld('apiUserNodesStorage', getFileStoreApi('userNodes'))
contextBridge.exposeInMainWorld('apiPoolsStorage', getFileStoreApi('pools'))

//
// api for update
//
const apiAppUpdate = {
  checkForAppUpdates: (): Promise<AppUpdateRD> => ipcRenderer.invoke(IPCMessages.APP_CHECK_FOR_UPDATE)
}
contextBridge.exposeInMainWorld('apiAppUpdate', apiAppUpdate)
