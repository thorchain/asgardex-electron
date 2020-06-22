import * as path from 'path'

import { encryptToKeyStore, decryptFromKeystore, Keystore as CryptoKeystore } from '@thorchain/asgardex-crypto'
// import { Either, right, left } from 'fp-ts/lib/Either'
import { none, some } from 'fp-ts/lib/Option'
import * as fs from 'fs-extra'

import { STORAGE_DIR } from '../../const'
import { observableState } from '../../helpers/stateHelper'
import { Phrase, KeystoreService, KeystoreState } from './types'
import { hasImportedKeystore } from './util'

// key file path
const KEY_FILE = path.join(STORAGE_DIR, 'keystore.json')

const { get$: getKeystoreState$, set: setKeystoreState } = observableState<KeystoreState>(none)

/**
 * Creates a keystore and saves it to disk
 */
const addKeystore = async (phrase: Phrase, password: string) => {
  try {
    const keystore: CryptoKeystore = await encryptToKeyStore(phrase, password)
    await fs.ensureFile(KEY_FILE)
    await fs.writeJSON(KEY_FILE, keystore)
    setKeystoreState(some(some(phrase)))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const removeKeystore = async () => {
  await fs.remove(KEY_FILE)
  setKeystoreState(none)
}

const addPhrase = async (state: KeystoreState, password: string) => {
  // make sure
  if (!hasImportedKeystore(state)) {
    return Promise.reject('Keystore has to be imported first')
  }

  // make sure file still exists
  const exists = await fs.pathExists(KEY_FILE)
  if (!exists) {
    return Promise.reject('Keystore has to be imported first')
  }

  // decrypt phrase from keystore
  try {
    const keystore: CryptoKeystore = await fs.readJSON(KEY_FILE)
    const phrase = await decryptFromKeystore(keystore, password)
    setKeystoreState(some(some(phrase)))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(`Could not decrypt phrase from keystore: ${error}`)
  }
}

// * Note: It does not remove keystore from filesystem!
const removePhrase = () => {
  setKeystoreState(some(none))
}

export const keystoreService: KeystoreService = {
  keystore$: getKeystoreState$,
  addKeystore,
  removeKeystore,
  lock: removePhrase,
  unlock: addPhrase
}
