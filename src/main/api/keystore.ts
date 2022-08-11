import * as path from 'path'

import { dialog, ipcRenderer } from 'electron'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'

import { KeystoreWallets, ipcKeystoreWalletsIO, keystoreIO } from '../../shared/api/io'
import { ApiKeystore, IPCExportKeystoreParams } from '../../shared/api/types'
import { mapIOErrors } from '../../shared/utils/fp'
import { defaultWalletName } from '../../shared/utils/wallet'
import IPCMessages from '../ipc/messages'
import { exists, readJSON, renameFile, writeJSON } from '../utils/file'
import { STORAGE_DIR } from './const'

export const LEGACY_KEYSTORE_ID = 1
const LEGACY_KEYSTORE_FILE = path.join(STORAGE_DIR, `keystore.json`)

const WALLETS_STORAGE_FILE = path.join(STORAGE_DIR, `wallets.json`)

/**
 * Exports existing keystore to let an user save it anywhere
 *
 * @param filename Name of keystore file to export
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

const migrateLegacyWallet = (): TE.TaskEither<Error, KeystoreWallets> =>
  FP.pipe(
    exists(LEGACY_KEYSTORE_FILE),
    // Switch to error if file does not exists
    TE.fromPredicate(
      (v) => !!v,
      () => Error(`${LEGACY_KEYSTORE_FILE} file does not exist`)
    ),
    // read keystore from disc
    TE.chain(() => readJSON(LEGACY_KEYSTORE_FILE)),
    // decode keystore content
    TE.chain(FP.flow(keystoreIO.decode, E.mapLeft(mapIOErrors), TE.fromEither)),
    // create legacy wallet
    TE.map((keystore) => [
      {
        id: LEGACY_KEYSTORE_ID,
        name: defaultWalletName(LEGACY_KEYSTORE_ID),
        selected: true,
        keystore
      }
    ]),
    TE.chain((wallets) =>
      FP.pipe(
        // rename keystore file to backup it
        renameFile(LEGACY_KEYSTORE_FILE, path.join(STORAGE_DIR, `keystore-legacy-${new Date().getTime()}.json`)),
        // return wallets in case of successfull backup
        TE.map(() => wallets)
      )
    )
  )

const loadWallets: TE.TaskEither<Error, KeystoreWallets> = FP.pipe(
  TE.tryCatch(
    async () => {
      const exists = await fs.pathExists(WALLETS_STORAGE_FILE)
      // empty list of wallets if `wallets.json` does not exist
      return exists ? fs.readJSON(WALLETS_STORAGE_FILE) : []
    },
    (e: unknown) => Error(`${e}`)
  ),
  TE.chain(FP.flow(ipcKeystoreWalletsIO.decode, E.mapLeft(mapIOErrors), TE.fromEither))
)

/**
 * Saves keystore wallets
 * It returns a list of wallets
 */
export const saveKeystoreWallets = (wallets: KeystoreWallets): TE.TaskEither<Error, KeystoreWallets> =>
  // 1. encode wallets
  FP.pipe(wallets, ipcKeystoreWalletsIO.encode, (walletsEncoded) =>
    FP.pipe(
      // 2. save wallets to disk
      writeJSON(`${WALLETS_STORAGE_FILE}`, walletsEncoded),
      // return wallets
      TE.map((_) => wallets)
    )
  )

/**
 * Initializes keystore wallets to migrate legacy keystore.json (if needed)
 *
 * It does the following:
 * 1. Load wallets (if available)
 * 2. Merge legacy keystore (if available and if no wallets)
 * 3. Save updated wallets to disk
 */
export const initKeystoreWallets: TE.TaskEither<Error, KeystoreWallets> = FP.pipe(
  loadWallets,
  TE.chain((wallets) => {
    // If we have already stored wallets,
    // another migration is not needed anymore.
    if (wallets.length) return TE.right(wallets)

    // In other case (no previous migration | no wallets)
    // Try to migrate legacy wallet and save wallets
    return FP.pipe(
      migrateLegacyWallet(),
      // Ignore any legacy keystore errors, but return empty list
      TE.alt(() => TE.right<Error, KeystoreWallets>([])),
      // save wallets to disk
      TE.chain(saveKeystoreWallets)
    )
  })
)

export const apiKeystore: ApiKeystore = {
  // Note: `params` need to be encoded by `ipcKeystoreWalletsIO` before calling `saveKeystoreWallets` */
  saveKeystoreWallets: (params: unknown) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE_WALLETS, params),
  exportKeystore: (params: IPCExportKeystoreParams) => ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, params),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE),
  initKeystoreWallets: () => ipcRenderer.invoke(IPCMessages.INIT_KEYSTORE_WALLETS)
}
