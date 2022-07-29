import * as path from 'path'

import { dialog, ipcRenderer } from 'electron'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'

import { KeystoreAccounts, ipcKeystoreAccountsIO, keystoreIO } from '../../shared/api/io'
import { ApiKeystore, IPCExportKeystoreParams } from '../../shared/api/types'
import { mapIOErrors } from '../../shared/utils/fp'
import IPCMessages from '../ipc/messages'
import { exists, readJSON, renameFile, writeJSON } from '../utils/file'
import { STORAGE_DIR } from './const'

export const LEGACY_KEYSTORE_ID = 1
const LEGACY_KEYSTORE_FILE = path.join(STORAGE_DIR, `keystore.json`)

const ACCOUNTS_STORAGE_FILE = path.join(STORAGE_DIR, `accounts.json`)

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

const migrateLegacyAccount = (): TE.TaskEither<Error, KeystoreAccounts> =>
  FP.pipe(
    exists(LEGACY_KEYSTORE_FILE),
    // Switch to error if no file exists
    TE.fromPredicate(
      (v) => !!v,
      () => Error('Keystore file does not exist')
    ),
    // get keystore content
    TE.chain(() => readJSON(LEGACY_KEYSTORE_FILE)),
    // decode keystore content
    TE.chain(FP.flow(keystoreIO.decode, E.mapLeft(mapIOErrors), TE.fromEither)),
    // create legacy account
    TE.map((keystore) => [
      {
        id: LEGACY_KEYSTORE_ID,
        name: `wallet-${LEGACY_KEYSTORE_ID}`,
        selected: true,
        keystore
      }
    ]),
    TE.chain((accounts) =>
      FP.pipe(
        // rename keystore file to backup it
        renameFile(LEGACY_KEYSTORE_FILE, path.join(STORAGE_DIR, `keystore-legacy-${new Date().getTime()}.json`)),
        // return accounts in case of successfull backup
        TE.map(() => accounts)
      )
    )
  )

const loadAccounts: TE.TaskEither<Error, KeystoreAccounts> = FP.pipe(
  TE.tryCatch(
    async () => {
      const exists = await fs.pathExists(ACCOUNTS_STORAGE_FILE)
      // empty list of accounts if `accounts.json` does not exist
      return exists ? fs.readJSON(ACCOUNTS_STORAGE_FILE) : []
    },
    (e: unknown) => Error(`${e}`)
  ),
  TE.chain(FP.flow(ipcKeystoreAccountsIO.decode, E.mapLeft(mapIOErrors), TE.fromEither))
)

/**
 * Saves keystore accounts
 * It returns a list of accounts
 */
export const saveKeystoreAccounts = (accounts: KeystoreAccounts): TE.TaskEither<Error, KeystoreAccounts> =>
  // 1. encode accounts
  FP.pipe(accounts, ipcKeystoreAccountsIO.encode, (accountsEncoded) =>
    FP.pipe(
      // 2. save accounts to disk
      writeJSON(`${ACCOUNTS_STORAGE_FILE}`, accountsEncoded),
      // return accounts
      TE.map((_) => accounts)
    )
  )

/**
 * Initializes keystore accounts to migrate legacy keystore.json (if needed)
 *
 * It does the following:
 * 1. Load accounts (if available)
 * 2. Merge legacy keystore (if available and if no accounts)
 * 3. Save updated accounts to disk
 */
export const initKeystoreAccounts: TE.TaskEither<Error, KeystoreAccounts> = FP.pipe(
  loadAccounts,
  TE.chain((accounts) => {
    // If we have already stored accounts,
    // another migration is not needed anymore.
    if (accounts.length) return TE.right(accounts)

    // In other case (no previous migration | no accounts)
    // Try to migrate legacy account and save accounts
    return FP.pipe(
      migrateLegacyAccount(),
      // Ignore any legacy keystore errors, but return empty list
      TE.alt(() => TE.right<Error, KeystoreAccounts>([])),
      // save accounts to disk
      TE.chain(saveKeystoreAccounts)
    )
  })
)

export const apiKeystore: ApiKeystore = {
  // Note: `params` need to be encoded by `ipcKeystoreAccountsIO` before calling `saveKeystoreAccounts` */
  saveKeystoreAccounts: (params: unknown) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE_ACCOUNTS, params),
  exportKeystore: (params: IPCExportKeystoreParams) => ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, params),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE),
  initKeystoreAccounts: () => ipcRenderer.invoke(IPCMessages.INIT_KEYSTORE_ACCOUNTS)
}
