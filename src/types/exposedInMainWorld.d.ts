import {
  ApiAppUpdate,
  ApiFileStoreService,
  ApiHDWallet,
  ApiKeystore,
  ApiLang,
  ApiUrl,
  StoreFileData
} from '../shared/api/types'

declare global {
  interface Window {
    /**
     * When declaring anything from the electron-world do not forget to
     * expose appropriate API at the src/main/preload.ts
     */
    apiKeystore: ApiKeystore
    apiLang: ApiLang
    apiUrl: ApiUrl
    apiHDWallet: ApiHDWallet
    apiCommonStorage: ApiFileStoreService<StoreFileData<'common'>>
    apiUserNodesStorage: ApiFileStoreService<StoreFileData<'userNodes'>>
    apiAppUpdate: ApiAppUpdate
  }
}
