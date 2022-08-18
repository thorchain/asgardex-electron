import * as RD from '@devexperts/remote-data-ts'
import { decryptFromKeystore, encryptToKeyStore, Keystore } from '@xchainjs/xchain-crypto'
import { delay } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ipcKeystoreWalletsIO, KeystoreWallets } from '../../../shared/api/io'
import { KeystoreId } from '../../../shared/api/types'
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
  KeystoreWalletsLD,
  KeystoreWalletsUI$,
  RenameKeystoreWalletHandler,
  ChangeKeystoreWalletHandler,
  isKeystoreUnlocked
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
 * State of importing a keystore wallet
 */
const { get$: importingKeystoreState$, set: setImportingKeystoreState } = observableState<
  RD.RemoteData<Error, boolean>
>(RD.initial)

/**
 * State of selected keystore wallet
 */
const {
  get$: keystoreState$,
  get: keystoreState,
  set: setKeystoreState
} = observableState<KeystoreState>(INITIAL_KEYSTORE_STATE)

/**
 * Internal state of keystore wallets - not shared to outside world
 */
const { get$: keystoreWallets$, get: keystoreWallets, set: setKeystoreWallets } = observableState<KeystoreWallets>([])

/**
 * Adds a keystore and saves it to disk
 */
const addKeystoreWallet = async ({ phrase, name, id, password }: AddKeystoreParams): Promise<void> => {
  try {
    setImportingKeystoreState(RD.pending)
    const keystore: Keystore = await encryptToKeyStore(phrase, password)

    // remove selected state from current wallets
    const wallets = FP.pipe(
      keystoreWallets(),
      A.map((wallet) => ({ ...wallet, selected: false }))
    )
    // Add new wallet to wallet list + mark it `selected`
    const updatedWallets: KeystoreWallets = [
      ...wallets,
      {
        id,
        name,
        keystore,
        selected: true
      }
    ]

    const encodedWallets = ipcKeystoreWalletsIO.encode(updatedWallets)
    // Save wallets to disk
    const _ = await window.apiKeystore.saveKeystoreWallets(encodedWallets)
    // Update states
    setKeystoreWallets(updatedWallets)
    setKeystoreState(O.some({ id, phrase, name }))
    setImportingKeystoreState(RD.success(true))
    return Promise.resolve()
  } catch (error) {
    setImportingKeystoreState(RD.failure(isError(error) ? error : Error('Could not add keystore')))
    return Promise.reject(error)
  }
}

export const removeKeystoreWallet = async () => {
  const state = keystoreState()

  const keystoreId = FP.pipe(state, getKeystoreId, O.toNullable)
  if (!keystoreId) {
    throw Error(`Can't remove wallet - keystore id is missing`)
  }
  // Remove it from `wallets`
  const wallets = FP.pipe(
    keystoreWallets(),
    A.filter(({ id }) => id !== keystoreId)
  )
  const encodedWallets = ipcKeystoreWalletsIO.encode(wallets)
  // Save updated `wallets` to disk
  const _ = await window.apiKeystore.saveKeystoreWallets(encodedWallets)
  // Update states
  setKeystoreWallets(wallets)
  // Set previous to current wallets (if available)
  const prevWallet = FP.pipe(wallets, A.last)
  setKeystoreState(prevWallet)

  // return no. of wallets
  return wallets.length
}

const changeKeystoreWallet: ChangeKeystoreWalletHandler = (keystoreId: KeystoreId) => {
  const wallets = keystoreWallets()
  // Get selected wallet
  const selectedWallet = FP.pipe(
    wallets,
    A.findFirst(({ id }) => id === keystoreId),
    O.toNullable
  )

  if (!selectedWallet) return Rx.of(RD.failure(Error(`Could not find a wallet in wallet list with id ${keystoreId}`)))

  const { id, name } = selectedWallet

  const updatedWallets = FP.pipe(
    wallets,
    A.map((wallet) => ({ ...wallet, selected: id === wallet.id }))
  )

  return FP.pipe(
    // encode wallets first
    Rx.of(ipcKeystoreWalletsIO.encode(updatedWallets)),
    // Save updated `wallets` to disk
    RxOp.switchMap((wallets) => Rx.from(window.apiKeystore.saveKeystoreWallets(wallets))),
    RxOp.map((eWallets) =>
      FP.pipe(
        eWallets,
        E.fold(
          (error) => RD.failure(Error(`Could not save wallets on disc ${error?.message ?? error.toString()}`)),
          (_) => {
            // Update states
            setKeystoreWallets(updatedWallets)
            // set selected wallet as locked wallet
            setKeystoreState(O.some({ id, name }))

            return RD.success(true)
          }
        )
      )
    ),
    RxOp.catchError((err) => Rx.of(RD.failure(err))),
    RxOp.startWith(RD.pending)
  )
}

const renameKeystoreWallet: RenameKeystoreWalletHandler = (id, name) => {
  // get keystore state - needs to be UNLOCKED
  const updatedKeystoreState = FP.pipe(
    keystoreState(),
    O.chain(FP.flow(O.fromPredicate(isKeystoreUnlocked))),
    // rename in state
    O.map((state) => ({ ...state, name })),
    O.toNullable
  )

  if (!updatedKeystoreState)
    return Rx.of(RD.failure(Error(`Could not rename wallet with id ${id} - it seems to be locked`)))

  // update selected wallet in list of wallets
  const updatedWallets = FP.pipe(
    keystoreWallets(),
    A.map((wallet) => (id === wallet.id ? { ...wallet, name } : wallet))
  )
  return FP.pipe(
    updatedWallets,
    // encode wallets first
    ipcKeystoreWalletsIO.encode,
    // Save updated `wallets` to disk
    (wallets) => Rx.from(window.apiKeystore.saveKeystoreWallets(wallets)),
    RxOp.catchError((err) => Rx.of(RD.failure(err))),
    RxOp.map(() => RD.success(true)),
    liveData.map((_) => {
      // Update states of all wallets
      setKeystoreWallets(updatedWallets)
      // set selected wallet - still unlocked
      setKeystoreState(O.some(updatedKeystoreState))
      return true
    }),
    RxOp.startWith(RD.pending)
  )
}

const importKeystore = async ({ keystore, password, name, id }: ImportKeystoreParams): Promise<void> => {
  try {
    setImportingKeystoreState(RD.pending)
    const phrase = await decryptFromKeystore(keystore, password)
    await delay(200)
    return await addKeystoreWallet({ phrase, name, id, password })
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
    const id = FP.pipe(keystoreState(), getKeystoreId, O.toNullable)
    if (!id) {
      throw Error(`Can't export keystore - keystore id is missing in KeystoreState`)
    }

    const wallets = keystoreWallets()
    const keystore = FP.pipe(wallets, getKeystore(id), O.toNullable)
    if (!keystore) {
      throw Error(`Can't export keystore - keystore is missing in wallet list`)
    }
    const fileName = `asgardex-${FP.pipe(wallets, getKeystoreWalletName(id), O.toNullable) || 'keystore'}.json`
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
  const state = keystoreState()
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
  const state = keystoreState()
  const lockedData = FP.pipe(state, getLockedData, O.toNullable)
  // make sure keystore is already imported
  if (!lockedData) {
    throw Error(`Can't unlock - keystore seems not to be imported`)
  }

  const { id, name } = lockedData

  // get keystore from wallet list (not stored in `KeystoreState`)
  const keystore = FP.pipe(keystoreWallets(), getKeystore(id), O.toNullable)
  if (!keystore) {
    throw Error(`Can't unlock - keystore is missing in wallet list`)
  }
  try {
    // decrypt phrase from keystore
    const phrase = await decryptFromKeystore(keystore, password)
    setKeystoreState(O.some({ id, phrase, name }))
  } catch (error) {
    throw Error(`Can't unlock - could not decrypt phrase from keystore: ${error}`)
  }
}

// `TriggerStream` to reload persistent `KeystoreWallets`
const { stream$: reloadPersistentKeystoreWallets$, trigger: reloadPersistentKeystoreWallets } = triggerStream()

/**
 * Persistent `KeystoreWallets` stored on disc.
 */
const keystoreWalletsPersistent$: KeystoreWalletsLD = FP.pipe(
  reloadPersistentKeystoreWallets$,
  RxOp.switchMap(() => Rx.from(window.apiKeystore.initKeystoreWallets())),
  RxOp.catchError((e) => Rx.of(E.left(e))),
  RxOp.switchMap(
    FP.flow(
      E.fold<Error, KeystoreWallets, KeystoreWalletsLD>(
        (e) => Rx.of(RD.failure(e)),
        (wallets) => Rx.of(RD.success(wallets))
      )
    )
  ),
  RxOp.startWith(RD.pending),
  RxOp.shareReplay(1)
)

// Subscribe keystoreWalletsPersistent$
// to update internal `KeystoreWallets` + `KeystoreState` stored in memory
// whenever data are loaded from disc,
keystoreWalletsPersistent$.subscribe((walletsRD) =>
  FP.pipe(
    walletsRD,
    RD.map((wallets) => {
      const state = getInitialKeystoreData(wallets)
      // update internal `KeystoreWallets` + `KeystoreState` stored in memory
      setKeystoreState(state)
      setKeystoreWallets(wallets)
      return true
    })
  )
)

// Simplified `KeystoreWallets` (w/o loading state, w/o `keystore`) to display data at UIs
const keystoreWalletsUI$: KeystoreWalletsUI$ = FP.pipe(
  keystoreWallets$,
  // Transform `KeystoreWallets` -> `KeystoreWalletsUI`
  RxOp.map(FP.flow(A.map(({ id, name, selected }) => ({ id, name, selected })))),
  RxOp.shareReplay(1)
)

const id = FP.pipe(keystoreState(), getKeystoreId)
if (!id) {
  throw Error(`Can't export keystore - keystore id is missing in KeystoreState`)
}

const validatePassword$ = (password: string): ValidatePasswordLD =>
  password
    ? FP.pipe(
        keystoreState(),
        getKeystoreId,
        O.chain((id) => FP.pipe(keystoreWallets(), getKeystore(id))),
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
  keystoreState$,
  addKeystoreWallet,
  removeKeystoreWallet,
  changeKeystoreWallet,
  renameKeystoreWallet,
  importKeystore,
  exportKeystore,
  loadKeystore$,
  lock,
  unlock,
  validatePassword$,
  keystoreWalletsPersistent$,
  reloadPersistentKeystoreWallets,
  keystoreWalletsUI$,
  importingKeystoreState$,
  resetImportingKeystoreState: () => setImportingKeystoreState(RD.initial)
}

// TODO(@Veado) Remove it - for debugging only
keystoreState$.subscribe((v) => console.log('keystoreState sub', v))
keystoreWallets$.subscribe((v) => console.log('keystoreWallets sub', v))
keystoreWalletsUI$.subscribe((v) => console.log('keystoreWalletsUI$ sub', v))
