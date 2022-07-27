import * as path from 'path'

import { dialog, ipcRenderer } from 'electron'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'
import * as PR from 'io-ts/lib/PathReporter'

import { KeystoreAccounts, ipcKeystoreAccountsIO, keystoreIO } from '../../shared/api/io'
import { ApiKeystore, IPCExportKeystoreParams } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'
import { exists, readJSON, writeJSON } from '../utils/file'
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
    TE.chain((ksExists) => {
      if (ksExists) return readJSON(LEGACY_KEYSTORE_FILE)
      // no keystore
      return TE.right(null)
    }),
    TE.map((v) => {
      console.log('migrateLegacyAccount read file', v)
      return v
    }),
    TE.chain(
      FP.flow(
        (v) => {
          console.log('migrateLegacyAccount flow ', v)
          return v
        },
        keystoreIO.decode,
        E.mapLeft((errors) => {
          console.log('migrateLegacyAccount errors ', errors)
          return new Error(PR.failure(errors).join('\n'))
        }),
        TE.fromEither
      )
    ),
    TE.map((v) => {
      console.log('migrateLegacyAccount decoded', v)
      return v
    }),
    // ... to put it into an account
    //  one account an user can have
    TE.map((keystore) => [
      {
        id: LEGACY_KEYSTORE_ID,
        name: `wallet-${LEGACY_KEYSTORE_ID}`,
        selected: true,
        keystore
      }
    ]),
    TE.map((v) => {
      console.log('migrateLegacyAccount accounts', v)
      return v
    })
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
  TE.chain(
    FP.flow(
      ipcKeystoreAccountsIO.decode,
      E.mapLeft((errors) => new Error(PR.failure(errors).join('\n'))),
      TE.fromEither
    )
  )
)

/**
 * Saves keystore accounts
 * It returns a list of accounts
 */
export const saveKeystoreAccounts = (accounts: KeystoreAccounts): TE.TaskEither<Error, KeystoreAccounts> =>
  FP.pipe(
    ipcKeystoreAccountsIO.decode(accounts),
    E.mapLeft((errors) => new Error(PR.failure(errors).join('\n'))),
    TE.fromEither,
    TE.chain((accountsDecoded) => {
      console.log('saveAccounts: accountsDecoded', accountsDecoded)
      return FP.pipe(
        writeJSON(`${ACCOUNTS_STORAGE_FILE}`, accountsDecoded),
        // return saved accounts
        TE.map((_) => accountsDecoded)
      )
    })
  )

/**
 * Initializes keystore accounts to migrate legacy keystore.json (if needed)
 *
 * It does the following:
 * 1. Load accounts (if available)
 * 2. Merge legacy keystore (if available and if no accounts)
 * 3. Save updated accounts on disk
 */
export const initKeystoreAccounts: TE.TaskEither<Error, KeystoreAccounts> = FP.pipe(
  loadAccounts,
  TE.chain((accounts) =>
    // If we have already saved accounts before, no migration is needed anymore
    accounts.length > 0 ? TE.fromEither(E.right(accounts)) : migrateLegacyAccount()
  ),
  TE.chain(saveKeystoreAccounts)
)

export const apiKeystore: ApiKeystore = {
  // Note: `params` need to be encoded by `ipcKeystoreAccountIO` before calling `saveKeystoreAccounts` */
  saveKeystoreAccounts: (params: unknown) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE_ACCOUNTS, params),
  exportKeystore: (params: IPCExportKeystoreParams) => ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, params),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE),
  initKeystoreAccounts: () => ipcRenderer.invoke(IPCMessages.INIT_KEYSTORE_ACCOUNTS)
}
