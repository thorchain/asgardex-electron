import * as RD from '@devexperts/remote-data-ts'
import { encryptToKeyStore, decryptFromKeystore, Keystore as CryptoKeystore } from '@xchainjs/xchain-crypto'
import { THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { truncateAddress } from '../../helpers/addressHelper'
import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { INITIAL_KEYSTORE_STATE } from './const'
import {
  Phrase,
  KeystoreService,
  KeystoreState,
  ValidatePasswordLD,
  ImportKeystoreLD,
  LoadKeystoreLD,
  ExportKeystoreParams
} from './types'
import { getKeystoreId, hasImportedKeystore } from './util'

const {
  get$: getKeystoreState$,
  get: getKeystoreState,
  set: setKeystoreState
} = observableState<KeystoreState>(INITIAL_KEYSTORE_STATE)

/**
 * Creates a keystore and saves it to disk
 */
const addKeystore = async (phrase: Phrase, password: string): Promise<void> => {
  try {
    // remove previous keystore if available before adding a new one to trigger changes of `KeystoreState
    const state = getKeystoreState()
    const prevId = FP.pipe(state, getKeystoreId, O.toNullable)
    if (prevId) {
      await removeKeystore()
    }
    const keystore: CryptoKeystore = await encryptToKeyStore(phrase, password)
    // id for keystore is current time (ms)
    // Note: Since nn user can add one keystore at time only
    // and a keystore with same name can't be overriden,
    // duplications are not possible
    const id = new Date().getTime().toString()
    await window.apiKeystore.save({ id, keystore })
    setKeystoreState(O.some({ id, phrase }))
    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

export const removeKeystore = async () => {
  const state = getKeystoreState()

  const id = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!id) {
    // TODO(@Veado) i18n
    throw Error(`Can't remove wallet - keystore id is missing`)
  }
  await window.apiKeystore.remove(id)
  setKeystoreState(O.none)
}

const importKeystore$ = (keystore: CryptoKeystore, password: string): ImportKeystoreLD => {
  return FP.pipe(
    Rx.from(decryptFromKeystore(keystore, password)),
    // delay to give UI some time to render
    RxOp.delay(200),
    RxOp.switchMap((phrase) => Rx.from(addKeystore(phrase, password))),
    RxOp.map(RD.success),
    RxOp.catchError((error) => Rx.of(RD.failure(new Error(`Could not decrypt phrase from keystore: ${error}`)))),
    RxOp.startWith(RD.pending)
  )
}

/**
 * Exports a keystore
 */
const exportKeystore = async ({ id, runeAddress, network }: ExportKeystoreParams) => {
  try {
    const keystore: CryptoKeystore = await window.apiKeystore.get(id)
    const fileName = `asgardex-keystore-${truncateAddress(runeAddress, THORChain, network)}.json`
    return await window.apiKeystore.export({ fileName, keystore })
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
    // delay to give UI some time to render
    RxOp.delay(200),
    RxOp.map((keystore) => (keystore ? RD.success(keystore) : RD.initial)), // handle undefined keystore in case when the user click cancel in openDialog
    RxOp.catchError((err) => Rx.of(RD.failure(err))),
    RxOp.startWith(RD.pending)
  )
}

const lock = async () => {
  const state = getKeystoreState()
  // make sure keystore is already imported
  if (!hasImportedKeystore(state)) {
    // TODO(@Veado) i18n
    throw Error(`Can't lock - keystore seems not to be imported`)
  }

  const id = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!id) {
    // TODO(@Veado) i18n
    throw Error(`Can't lock - keystore id is missing`)
  }

  setKeystoreState(O.some({ id }))
}

const unlock = async (password: string) => {
  const state = getKeystoreState()
  // make sure keystore is already imported
  if (!hasImportedKeystore(state)) {
    // TODO(@Veado) i18n
    throw Error(`Can't unlock - keystore seems not to be imported`)
  }
  const id = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!id) {
    // TODO(@Veado) i18n
    throw Error(`Can't unlock - keystore id is missing`)
  }

  // make sure file still exists
  const exists = await window.apiKeystore.exists(id)
  if (!exists) {
    // TODO(@Veado) i18n
    throw Error(`Can't unlock - Keystore has not be save on disc`)
  }

  // decrypt phrase from keystore
  try {
    const keystore: CryptoKeystore = await window.apiKeystore.get(id)
    const phrase = await decryptFromKeystore(keystore, password)
    setKeystoreState(O.some({ phrase, id }))
  } catch (error) {
    // TODO(@Veado) i18n
    throw Error(`Can't unlock - could not decrypt phrase from keystore: ${error}`)
  }
}

// check keystore at start
// TODO(@veado) Get id from persistant storage or fro legacy `keystore`
window.apiKeystore.exists('keystore').then(
  (result) => setKeystoreState(result ? O.some({ id: 'keystore' }) /*imported, but locked*/ : O.none /*not imported*/),
  (_) => setKeystoreState(O.none /*not imported*/)
)

const validatePassword$ = (password: string): ValidatePasswordLD =>
  password
    ? FP.pipe(
        // TODO(@veado) Get id from KeystoreState
        Rx.from(window.apiKeystore.get('keystore')),
        RxOp.switchMap((keystore) => Rx.from(decryptFromKeystore(keystore, password))),
        RxOp.map(RD.success),
        liveData.map(() => undefined),
        RxOp.catchError((err) => Rx.of(RD.failure(err))),
        RxOp.startWith(RD.pending)
      )
    : Rx.of(RD.initial)

export const keystoreService: KeystoreService = {
  keystore$: getKeystoreState$,
  addKeystore,
  removeKeystore,
  importKeystore$,
  exportKeystore,
  loadKeystore$,
  lock,
  unlock,
  validatePassword$
}
