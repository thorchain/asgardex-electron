import * as RD from '@devexperts/remote-data-ts'
import { decryptFromKeystore, encryptToKeyStore, Keystore } from '@xchainjs/xchain-crypto'
import { delay } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ipcKeystoreAccountsIO, KeystoreAccounts } from '../../../shared/api/io'
import { isError } from '../../../shared/utils/guard'
import { liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { INITIAL_KEYSTORE_STATE } from './const'
import {
  KeystoreService,
  KeystoreState,
  ValidatePasswordLD,
  LoadKeystoreLD,
  ImportKeystoreParams,
  AddKeystoreParams,
  KeystoreAccountsLD,
  KeystoreAccountsUI$
} from './types'
import {
  getKeystore,
  getKeystoreWalletName,
  getKeystoreId,
  hasImportedKeystore,
  getLockedData,
  getInitialKeystoreData
} from './util'

/**
 * State of importing keystore account
 */
const { get$: importingKeystoreState$, set: setImportingKeystoreState } = observableState<
  RD.RemoteData<Error, boolean>
>(RD.initial)

/**
 * State of selected keystore account
 */
const {
  get$: getKeystoreState$,
  get: getKeystoreState,
  set: setKeystoreState
} = observableState<KeystoreState>(INITIAL_KEYSTORE_STATE)

/**
 * Internal state of keystore accounts - not shared to outside world
 */
const {
  get$: getKeystoreAccounts$,
  get: getKeystoreAccounts,
  set: setKeystoreAccounts
} = observableState<KeystoreAccounts>([])

/**
 * Adds a keystore and saves it to disk
 */
const addKeystoreAccount = async ({ phrase, name, id, password }: AddKeystoreParams): Promise<void> => {
  try {
    setImportingKeystoreState(RD.pending)
    const keystore: Keystore = await encryptToKeyStore(phrase, password)

    // remove selected state from current accounts
    const accounts = FP.pipe(
      getKeystoreAccounts(),
      A.map((account) => ({ ...account, selected: false }))
    )
    // Add account to accounts + mark it `selected`
    const newAccounts: KeystoreAccounts = [
      ...accounts,
      {
        id,
        name,
        keystore,
        selected: true
      }
    ]

    const encodedAccounts = ipcKeystoreAccountsIO.encode(newAccounts)
    // Save accounts to disk
    await window.apiKeystore.saveKeystoreAccounts(encodedAccounts)
    // Update states
    setKeystoreAccounts(newAccounts)
    setKeystoreState(O.some({ id, phrase, name }))
    setImportingKeystoreState(RD.success(true))
    return Promise.resolve()
  } catch (error) {
    setImportingKeystoreState(RD.failure(isError(error) ? error : Error('Could not add keystore')))
    return Promise.reject(error)
  }
}

export const removeKeystoreAccount = async () => {
  const state = getKeystoreState()

  const id = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!id) {
    throw Error(`Can't remove wallet - keystore id is missing`)
  }
  // Remove it from `accounts`
  const accounts = FP.pipe(
    getKeystoreAccounts(),
    A.filter(({ id: accountId }) => accountId !== id)
  )
  const encodedAccounts = ipcKeystoreAccountsIO.encode(accounts)
  // Save updated `accounts` to disk
  await window.apiKeystore.saveKeystoreAccounts(encodedAccounts)
  // Update states
  setKeystoreAccounts(accounts)
  // Set previous to current account (if available)
  const prevAccount = FP.pipe(accounts, A.last)
  setKeystoreState(prevAccount)

  // return no. of accounts
  return accounts.length
}

const importKeystore = async ({ keystore, password, name, id }: ImportKeystoreParams): Promise<void> => {
  try {
    setImportingKeystoreState(RD.pending)
    const phrase = await decryptFromKeystore(keystore, password)
    await delay(200)
    return await addKeystoreAccount({ phrase, name, id, password })
  } catch (error) {
    setImportingKeystoreState(RD.failure(isError(error) ? error : Error('Could not add keystore')))
    return Promise.reject(error)
  }
}

/**
 * Exports a keystore
 */
const exportKeystore = async () => {
  try {
    const id = FP.pipe(getKeystoreState(), getKeystoreId, O.toNullable)
    if (!id) {
      throw Error(`Can't export keystore - keystore id is missing in KeystoreState`)
    }

    const accounts = getKeystoreAccounts()
    const keystore = FP.pipe(accounts, getKeystore(id), O.toNullable)
    if (!keystore) {
      throw Error(`Can't export keystore - keystore is missing in accounts`)
    }
    const fileName = `asgardex-${FP.pipe(accounts, getKeystoreWalletName(id), O.toNullable) || 'keystore'}.json`
    return await window.apiKeystore.exportKeystore({ fileName, keystore })
  } catch (error) {
    return Promise.reject(error)
  }
}

/**
 * Loads a keystore into memory
 * using Electron's native file dialog
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
    throw Error(`Can't lock - keystore seems not to be imported`)
  }

  const lockedState = FP.pipe(getLockedData(state), O.toNullable)
  if (!lockedState) {
    throw Error(`Can't lock - keystore 'id' and / or 'name' are missing`)
  }
  setKeystoreState(O.some(lockedState))
}

const unlock = async (password: string) => {
  const state = getKeystoreState()
  const lockedData = FP.pipe(state, getLockedData, O.toNullable)
  // make sure keystore is already imported
  if (!lockedData) {
    throw Error(`Can't unlock - keystore seems not to be imported`)
  }

  const { id, name } = lockedData

  // get keystore from account list (not stored in `KeystoreState`)
  const keystore = FP.pipe(getKeystoreAccounts(), getKeystore(id), O.toNullable)
  if (!keystore) {
    throw Error(`Can't unlock - keystore is missing in accounts`)
  }
  try {
    // decrypt phrase from keystore
    const phrase = await decryptFromKeystore(keystore, password)
    setKeystoreState(O.some({ id, phrase, name }))
  } catch (error) {
    throw Error(`Can't unlock - could not decrypt phrase from keystore: ${error}`)
  }
}

// `TriggerStream` to reload data of `ThorchainLastblock`
const { stream$: reloadKeystoreAccounts$, trigger: reloadKeystoreAccounts } = triggerStream()

const keystoreAccounts$: KeystoreAccountsLD = FP.pipe(
  reloadKeystoreAccounts$,
  RxOp.switchMap(() => Rx.from(window.apiKeystore.initKeystoreAccounts())),
  RxOp.catchError((e) => Rx.of(E.left(e))),
  RxOp.switchMap(
    FP.flow(
      E.fold<Error, KeystoreAccounts, KeystoreAccountsLD>(
        (e) => Rx.of(RD.failure(e)),
        (accounts) => Rx.of(RD.success(accounts))
      )
    )
  ),
  liveData.map((accounts) => {
    const state = getInitialKeystoreData(accounts)

    setKeystoreState(state)
    setKeystoreAccounts(accounts)

    return accounts
  }),
  RxOp.startWith(RD.pending),
  RxOp.shareReplay(1)
)

// Simplified `KeystoreAccounts` (w/o loading state, w/o `keystore`) to display data at UIs
const keystoreAccountsUI$: KeystoreAccountsUI$ = FP.pipe(
  getKeystoreAccounts$,
  // Transform `KeystoreAccounts` -> `KeystoreAccountsUI`
  RxOp.map(FP.flow(A.map(({ id, name, selected }) => ({ id, name, selected })))),
  RxOp.shareReplay(1)
)

const id = FP.pipe(getKeystoreState(), getKeystoreId)
if (!id) {
  throw Error(`Can't export keystore - keystore id is missing in KeystoreState`)
}

const validatePassword$ = (password: string): ValidatePasswordLD =>
  password
    ? FP.pipe(
        getKeystoreState(),
        getKeystoreId,
        O.chain((id) => FP.pipe(getKeystoreAccounts(), getKeystore(id))),
        O.fold(
          () => Rx.of(RD.failure(Error('Could not get current keystore to validate password'))),
          (keystore) =>
            FP.pipe(
              Rx.from(decryptFromKeystore(keystore, password)),
              // // don't store phrase in result
              RxOp.map((_ /* phrase */) => RD.success(undefined)),
              RxOp.catchError((err) => Rx.of(RD.failure(err)))
            )
        ),
        RxOp.startWith(RD.pending)
      )
    : Rx.of(RD.initial)

export const keystoreService: KeystoreService = {
  keystore$: getKeystoreState$,
  addKeystoreAccount,
  removeKeystoreAccount,
  importKeystore,
  exportKeystore,
  loadKeystore$,
  lock,
  unlock,
  validatePassword$,
  reloadKeystoreAccounts,
  keystoreAccountsUI$,
  keystoreAccounts$,
  importingKeystoreState$,
  resetImportingKeystoreState: () => setImportingKeystoreState(RD.initial)
}

// TODO(@Veado) Remove it - for debugging only
getKeystoreState$.subscribe((v) => console.log('keystoreState subscription', v))
getKeystoreAccounts$.subscribe((v) => console.log('keystoreAccounts subscription', v))
