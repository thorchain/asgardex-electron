import * as path from 'path'

import { Keystore } from '@xchainjs/xchain-crypto'
import { dialog, ipcRenderer } from 'electron'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import * as fs from 'fs-extra'
import * as PR from 'io-ts/lib/PathReporter'

import { KeystoreAccount, KeystoreAccounts, ipcKeystoreAccountsIO } from '../../shared/api/io'
import {
  ApiKeystore,
  IPCExportKeystoreParams,
  IPCSaveKeystoreParams,
  KeystoreId,
  KeystoreIds
} from '../../shared/api/types'
import { sequenceTTaskEither } from '../../shared/utils/fp'
import { keystoreIdsFromFileNames } from '../../shared/utils/keystore'
import IPCMessages from '../ipc/messages'
import { readDir } from '../utils/file'
import { STORAGE_DIR } from './const'

export const LEGACY_KEYSTORE_ID = 1
export const KEYSTORE_FILE_PREFIX = 'keystore'

const getKeyFilePath = (id: number): string => {
  const fileName = id === LEGACY_KEYSTORE_ID ? `${KEYSTORE_FILE_PREFIX}` : `${KEYSTORE_FILE_PREFIX}-${id}`
  return path.join(STORAGE_DIR, `${fileName}.json`)
}

const ACCOUNTS_STORAGE_FILE = path.join(STORAGE_DIR, `accounts.json`)

/**
 * Saves keystore to file system
 * Note: id === file name
 *
 * @param id Keystore id (Note: id === file name)
 * @param keystore Keystore content
 */
export const saveKeystore = async ({ id, keystore }: IPCSaveKeystoreParams) => {
  const alreadyExists = await keystoreExist(id)
  // Never override an existing keystore
  if (alreadyExists) {
    throw Error(`Keystore can't be overriden - it already exists (keystore id: ${id})`)
  }
  const path = getKeyFilePath(id)
  // make sure path is valid to write keystore to it
  // https://github.com/jprichardson/node-fs-extra/blob/master/docs/ensureFile.md
  await fs.ensureFile(path)
  // write keystore into JSON file
  // https://github.com/jprichardson/node-fs-extra/blob/master/docs/writeJson.md
  return fs.writeJSON(path, keystore)
}

/**
 * Removes keystore from file system
 */
export const removeKeystore = async (id: number) => {
  const path = getKeyFilePath(id)
  // If `KEY_FILE' does not exist, `fs.remove` silently does nothing.
  // ^ see https://github.com/jprichardson/node-fs-extra/blob/master/docs/remove.md
  return fs.remove(path)
}

/**
 * Gets keystore from file system
 *
 * @param id Keystore id (Note: id === file name)
 */
export const getKeystore = async (id: number): Promise<Keystore> => {
  const path = getKeyFilePath(id)
  return fs.readJSON(path)
}

/**
 * Checks wether keystore already exists on file system or not
 *
 * @param id Keystore id (Note: id === file name)
 */
export const keystoreExist = async (id: number): Promise<boolean> => {
  const path = getKeyFilePath(id)
  return await fs.pathExists(path)
}

/**
 * Exports existing keystore to let an user save it anywhere
 *
 * @param id Keystore id (Note: id === file name)
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

const loadKeystoreIds: TE.TaskEither<Error, KeystoreIds> = FP.pipe(
  readDir(STORAGE_DIR),
  TE.map(keystoreIdsFromFileNames)
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

const filterAccountsByIds = (ids: number[], accounts: KeystoreAccounts): KeystoreAccounts =>
  FP.pipe(
    accounts,
    A.filter(({ id }) => ids.includes(id))
  )

const createAccounts = (ids: number[]): KeystoreAccounts =>
  FP.pipe(
    ids,
    A.mapWithIndex<number, KeystoreAccount>((index, id) => ({
      id,
      name: `wallet-${id}`,
      selected: index === 0
    }))
  )

const mergeKeystoreIdsWithAccounts = ([ids, accounts]: [number[], KeystoreAccounts]): KeystoreAccounts => {
  const filtered = filterAccountsByIds(ids, accounts)
  if (filtered.length > 0) return filtered

  return createAccounts(ids)
}

/**
 * Saves keystore accounts
 * It returns a list of accounts
 */
const saveAccounts = (accounts: KeystoreAccounts): TE.TaskEither<Error, KeystoreAccounts> =>
  FP.pipe(
    ipcKeystoreAccountsIO.decode(accounts),
    E.mapLeft((errors) => new Error(PR.failure(errors).join('\n'))),
    TE.fromEither,
    TE.chain((accountsDecoded) =>
      FP.pipe(
        TE.tryCatch(
          () => fs.writeJSON(`${ACCOUNTS_STORAGE_FILE}`, accountsDecoded),
          (e: unknown) => Error(`${e}`)
        ),
        TE.map((_) => accountsDecoded)
      )
    )
  )

// 1. Check stored keystores on file system
// 2. Compare with stored accounts
// 3. Update stored accounts if needed
// 4. return accounts
export const initKeystoreAccounts: TE.TaskEither<Error, KeystoreAccounts> = FP.pipe(
  sequenceTTaskEither(loadKeystoreIds, loadAccounts),
  TE.map(mergeKeystoreIdsWithAccounts),
  TE.chain(saveAccounts)
)

export const apiKeystore: ApiKeystore = {
  save: (params: IPCSaveKeystoreParams) => ipcRenderer.invoke(IPCMessages.SAVE_KEYSTORE, params),
  remove: (id: KeystoreId) => ipcRenderer.invoke(IPCMessages.REMOVE_KEYSTORE, id),
  get: (id: KeystoreId) => ipcRenderer.invoke(IPCMessages.GET_KEYSTORE, id),
  exists: (id: KeystoreId) => ipcRenderer.invoke(IPCMessages.KEYSTORE_EXIST, id),
  export: (params: IPCExportKeystoreParams) => ipcRenderer.invoke(IPCMessages.EXPORT_KEYSTORE, params),
  load: () => ipcRenderer.invoke(IPCMessages.LOAD_KEYSTORE),
  initKeystoreAccounts: () => ipcRenderer.invoke(IPCMessages.INIT_KEYSTORE_ACCOUNTS)
}
