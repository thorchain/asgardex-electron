import { contextBridge } from 'electron'

import { apiHDWallet } from './api/hdwallet'
import { apiKeystore } from './api/keystore'
import { apiLang } from './api/lang'
import { apiUrl } from './api/url'

// ContextBridge is used here to expose custom api objects on `window`
// to be accessable at `renderer` processes,
// even if `contextIsolation` is enabled
// https://www.electronjs.org/docs/api/context-bridge

// `apiKeystore` object
contextBridge.exposeInMainWorld('apiKeystore', apiKeystore)
// `apiLang` object
contextBridge.exposeInMainWorld('apiLang', apiLang)
// `apiUrl` object
contextBridge.exposeInMainWorld('apiUrl', apiUrl)
// `apiHDWallet` object
contextBridge.exposeInMainWorld('apiHDWallet', apiHDWallet)
