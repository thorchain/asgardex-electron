import { encryptToKeyStore, decryptFromKeystore, Keystore as CryptoKeystore } from '@thorchain/asgardex-crypto'
import { none, some } from 'fp-ts/lib/Option'

import { observableState } from '../../helpers/stateHelper'
import { Phrase, KeystoreService, KeystoreState } from './types'
import { hasImportedKeystore } from './util'

export const initialKeystoreState = (): KeystoreState => none

const { get$: getKeystoreState$, set: setKeystoreState } = observableState<KeystoreState>(initialKeystoreState())

/**
 * Creates a keystore and saves it to disk
 */
const addKeystore = async (phrase: Phrase, password: string) => {
  try {
    // remove previous keystore before adding a new one to trigger changes of `KeystoreState
    await keystoreService.removeKeystore()
    const keystore: CryptoKeystore = await encryptToKeyStore(phrase, password)
    await window.apiKeystore.save(keystore)
    setKeystoreState(some(some({ phrase })))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const removeKeystore = async () => {
  await window.apiKeystore.remove()
  setKeystoreState(none)
}

const addPhrase = async (state: KeystoreState, password: string) => {
  // make sure
  if (!hasImportedKeystore(state)) {
    // TODO(@Veado) i18m
    return Promise.reject('Keystore has to be imported first')
  }

  // make sure file still exists
  const exists = await window.apiKeystore.exists()
  if (!exists) {
    // TODO(@Veado) i18m
    return Promise.reject('Keystore has to be imported first')
  }

  // decrypt phrase from keystore
  try {
    const keystore: CryptoKeystore = await window.apiKeystore.get()
    const phrase = await decryptFromKeystore(keystore, password)
    setKeystoreState(some(some({ phrase })))
    return Promise.resolve()
  } catch (error) {
    // TODO(@Veado) i18m
    return Promise.reject(`Could not decrypt phrase from keystore: ${error}`)
  }
}

// check keystore at start
window.apiKeystore.exists().then(
  (result) => setKeystoreState(result ? some(none) /*imported, but locked*/ : none /*not imported*/),
  (_) => setKeystoreState(none /*not imported*/)
)

export const keystoreService: KeystoreService = {
  keystore$: getKeystoreState$,
  addKeystore,
  removeKeystore,
  lock: () => setKeystoreState(some(none)),
  unlock: addPhrase
}
