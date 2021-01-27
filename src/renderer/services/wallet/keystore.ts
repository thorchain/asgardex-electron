import * as RD from '@devexperts/remote-data-ts'
import { encryptToKeyStore, decryptFromKeystore, Keystore as CryptoKeystore } from '@xchainjs/xchain-crypto'
import { THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { truncateAddress } from '../../helpers/addressHelper'
import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { INITIAL_KEYSTORE_STATE } from './const'
import { Phrase, KeystoreService, KeystoreState, ValidatePasswordLD, ImportKeystoreLD, LoadKeystoreLD } from './types'
import { hasImportedKeystore } from './util'

const { get$: getKeystoreState$, set: setKeystoreState } = observableState<KeystoreState>(INITIAL_KEYSTORE_STATE)

/**
 * Creates a keystore and saves it to disk
 */
const addKeystore = async (phrase: Phrase, password: string) => {
  try {
    // remove previous keystore before adding a new one to trigger changes of `KeystoreState
    await keystoreService.removeKeystore()
    const keystore: CryptoKeystore = await encryptToKeyStore(phrase, password)
    await window.apiKeystore.save(keystore)
    setKeystoreState(O.some(O.some({ phrase })))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const removeKeystore = async () => {
  await window.apiKeystore.remove()
  setKeystoreState(O.none)
}

const importKeystore$ = (keystore: CryptoKeystore, password: string): ImportKeystoreLD => {
  return FP.pipe(
    Rx.from(decryptFromKeystore(keystore, password)),
    switchMap((phrase) => addKeystore(phrase, password)),
    map(RD.success),
    catchError((error) => Rx.of(RD.failure(new Error(`Could not decrypt phrase from keystore: ${error}`)))),
    startWith(RD.pending)
  )
}

/**
 * Exports a keystore
 */
const exportKeystore = async (runeNativeAddress: string, network: Network) => {
  try {
    const keystore: CryptoKeystore = await window.apiKeystore.get()
    const defaultFileName = `asgardex-keystore-${truncateAddress(runeNativeAddress, THORChain, network)}.json`
    return await window.apiKeystore.export(defaultFileName, keystore)
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * loads a keystore
 */
const loadKeystore$ = (): LoadKeystoreLD => {
  return FP.pipe(
    Rx.from(window.apiKeystore.load()),
    map((keystore) => (keystore ? RD.success(keystore) : RD.initial)), // handle undeifined keystore in case when the user click cancel in openDialog
    catchError((err) => Rx.of(RD.failure(err))),
    startWith(RD.pending)
  )
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
    setKeystoreState(O.some(O.some({ phrase })))
    return Promise.resolve()
  } catch (error) {
    // TODO(@Veado) i18m
    return Promise.reject(`Could not decrypt phrase from keystore: ${error}`)
  }
}

// check keystore at start
window.apiKeystore.exists().then(
  (result) => setKeystoreState(result ? O.some(O.none) /*imported, but locked*/ : O.none /*not imported*/),
  (_) => setKeystoreState(O.none /*not imported*/)
)

const validatePassword$ = (password: string): ValidatePasswordLD =>
  password
    ? FP.pipe(
        Rx.from(window.apiKeystore.get()),
        switchMap((keystore) => Rx.from(decryptFromKeystore(keystore, password))),
        map(RD.success),
        liveData.map(() => undefined),
        catchError((err) => Rx.of(RD.failure(err))),
        startWith(RD.pending)
      )
    : Rx.of(RD.initial)

export const keystoreService: KeystoreService = {
  keystore$: getKeystoreState$,
  addKeystore,
  removeKeystore,
  importKeystore$,
  exportKeystore,
  loadKeystore$,
  lock: () => setKeystoreState(O.some(O.none)),
  unlock: addPhrase,
  validatePassword$
}
