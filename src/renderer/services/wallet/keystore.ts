import * as RD from '@devexperts/remote-data-ts'
import { decryptFromKeystore, encryptToKeyStore, Keystore } from '@xchainjs/xchain-crypto'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ipcKeystoreAccountsIO, KeystoreAccounts } from '../../../shared/api/io'
import { MOCK_KEYSTORE } from '../../../shared/mock/wallet'
import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { INITIAL_KEYSTORE_STATE } from './const'
import {
  KeystoreService,
  KeystoreState,
  ValidatePasswordLD,
  ImportKeystoreLD,
  LoadKeystoreLD,
  ImportKeystoreParams,
  AddKeystoreParams
} from './types'
import { getKeystore, getKeystoreAccountName, getKeystoreId, getSelectedKeystoreId, hasImportedKeystore } from './util'

/**
 * State of selected keystore account
 */
const {
  get$: getKeystoreState$,
  get: getKeystoreState,
  set: setKeystoreState
} = observableState<KeystoreState>(INITIAL_KEYSTORE_STATE)

const {
  get$: getKeystoreAccounts$,
  get: getKeystoreAccounts,
  set: setKeystoreAccounts
} = observableState<KeystoreAccounts>([])

/**
 * Adds a keystore and saves it to disk
 */
const addKeystoreAccount = async ({ phrase, name, id, password }: AddKeystoreParams): Promise<void> => {
  console.log('///// addKeystoreAccount')
  try {
    const keystore: Keystore = await encryptToKeyStore(phrase, password)

    console.log('keystore', keystore)
    // remove selected state from current accounts
    const accounts = FP.pipe(
      getKeystoreAccounts(),
      A.map((account) => ({ ...account, selected: false }))
    )
    console.log('accounts', accounts)
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

    console.log('newAccounts', newAccounts)
    const encodedAccounts = ipcKeystoreAccountsIO.encode(newAccounts)
    // Save accounts to disk
    await window.apiKeystore.saveKeystoreAccounts(encodedAccounts)
    // Update states
    setKeystoreAccounts(newAccounts)
    setKeystoreState(O.some({ id, phrase }))

    console.log('///// addKeystoreAccount END')
    return Promise.resolve()
  } catch (error) {
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
  setKeystoreState(O.none)
}

const importKeystore$ = ({ keystore, password, name, id }: ImportKeystoreParams): ImportKeystoreLD => {
  return FP.pipe(
    Rx.from(decryptFromKeystore(keystore, password)),
    // delay to give UI some time to render
    RxOp.delay(200),
    RxOp.switchMap((phrase) => Rx.from(addKeystoreAccount({ phrase, name, id, password }))),
    RxOp.map(RD.success),
    RxOp.catchError((error) => Rx.of(RD.failure(new Error(`Could not decrypt phrase from keystore: ${error}`)))),
    RxOp.startWith(RD.pending)
  )
}

/**
 * Exports a keystore
 */
const exportKeystore = async () => {
  try {
    const id = FP.pipe(getKeystoreState(), getKeystoreId, O.toNullable)
    if (!id) {
      // TODO(@Veado) i18n
      throw Error(`Can't export keystore - keystore id is missing in KeystoreState`)
    }

    const accounts = getKeystoreAccounts()
    const keystore = FP.pipe(accounts, getKeystore(id), O.toNullable)
    if (!keystore) {
      // TODO(@Veado) i18n
      throw Error(`Can't export keystore - keystore is missing in accounts`)
    }
    const name = FP.pipe(accounts, getKeystoreAccountName(id), O.toNullable)
    const fileName = `asgardex-${name}.json`
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
    // TODO(@Veado) i18n
    throw Error(`Can't lock - keystore seems not to be imported`)
  }

  const id = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!id) {
    throw Error(`Can't lock - keystore id is missing`)
  }

  setKeystoreState(O.some({ id }))
}

const unlock = async (password: string) => {
  const state = getKeystoreState()
  // make sure keystore is already imported
  if (!hasImportedKeystore(state)) {
    throw Error(`Can't unlock - keystore seems not to be imported`)
  }
  // Get keystore id
  const id = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!id) {
    throw Error(`Can't unlock - keystore id is missing`)
  }
  // decrypt phrase from keystore
  const keystore = FP.pipe(getKeystoreAccounts(), getKeystore(id), O.toNullable)
  if (!keystore) {
    throw Error(`Can't unlock - keystore is missing in accounts`)
  }
  try {
    const phrase = await decryptFromKeystore(keystore, password)
    setKeystoreState(O.some({ phrase, id }))
  } catch (error) {
    throw Error(`Can't unlock - could not decrypt phrase from keystore: ${error}`)
  }
}

// initialize accounts at start
window.apiKeystore.initKeystoreAccounts().then(
  (eAccounts) => {
    // Transform Promise<Either> -> Promise
    FP.pipe(
      eAccounts,
      E.fold(
        (error) => {
          console.log('getAccounts error:', error)
        },
        (accounts) => {
          console.log('getAccounts accounts:', accounts)
          const state =
            accounts.length > 0
              ? O.some({
                  // try to get selected state from accounts
                  id: FP.pipe(accounts, getSelectedKeystoreId, O.toNullable) || accounts[0].id
                }) /*imported, but locked*/
              : O.none /*not imported*/
          setKeystoreState(state)
          setKeystoreAccounts(accounts)
        }
      )
    )
  },
  (error) => {
    console.log('getAccounts error:', error)
  }
)

const validatePassword$ = (password: string): ValidatePasswordLD =>
  password
    ? FP.pipe(
        // TODO(@veado) Get keystore from accounts
        // Rx.from(window.apiKeystore.get(1 /* LEGACY_KEYSTORE_ID */)),
        Rx.of(MOCK_KEYSTORE),
        RxOp.switchMap((keystore) => Rx.from(decryptFromKeystore(keystore, password))),
        RxOp.map(RD.success),
        liveData.map(() => undefined),
        RxOp.catchError((err) => Rx.of(RD.failure(err))),
        RxOp.startWith(RD.pending)
      )
    : Rx.of(RD.initial)

export const keystoreService: KeystoreService = {
  keystore$: getKeystoreState$,
  addKeystoreAccount,
  removeKeystoreAccount,
  importKeystore$,
  exportKeystore,
  loadKeystore$,
  lock,
  unlock,
  validatePassword$
}

// TODO(@Veado) Remove it - for debugging only
getKeystoreState$.subscribe((v) => console.log('keystoreState', v))
getKeystoreAccounts$.subscribe((v) => console.log('keystoreAccounts', v))
