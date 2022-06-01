import { contextBridge } from 'electron'

import { apiAppUpdate } from './api/appUpdate'
import { getFileStoreApi } from './api/fileStore'
import { apiHDWallet } from './api/hdwallet'
import { apiKeystore } from './api/keystore'
import { apiLang } from './api/lang'
import { apiUrl } from './api/url'

// ContextBridge is used here to expose custom api objects on `window`
// to be accessable at `renderer` processes,
// even if `contextIsolation` is enabled
// https://www.electronjs.org/docs/api/context-bridge

/**
 * When exposing anything to the real world do not forget to
 * declare appropriate types for global Window interface
 * at the src/shared/api/types.ts
 */
// `apiKeystore` object
contextBridge.exposeInMainWorld('apiKeystore', apiKeystore)
// `apiLang` object
contextBridge.exposeInMainWorld('apiLang', apiLang)
// `apiUrl` object
contextBridge.exposeInMainWorld('apiUrl', apiUrl)
// `apiHDWallet` object
contextBridge.exposeInMainWorld('apiHDWallet', apiHDWallet)
// api for storage objects
contextBridge.exposeInMainWorld('apiCommonStorage', getFileStoreApi('common'))
contextBridge.exposeInMainWorld('apiUserNodesStorage', getFileStoreApi('userNodes'))
contextBridge.exposeInMainWorld('apiPoolsStorage', getFileStoreApi('pools'))

contextBridge.exposeInMainWorld('apiAppUpdate', apiAppUpdate)
