import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as N from 'fp-ts/number'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { KeystoreId, LedgerErrorId } from '../../../shared/api/types'
import { isError } from '../../../shared/utils/guard'
import { WalletAddress } from '../../../shared/wallet/types'
import { eqChain, eqKeystoreId, eqNetwork, eqOKeystoreLedgerAddress } from '../../helpers/fp/eq'
import { liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Network$ } from '../app/types'
import { INITIAL_KEYSTORE_LEDGER_ADDRESSES } from './const'
import {
  GetKeystoreLedgerAddressHandler,
  KeystoreState$,
  KeystoreLedgerAddresses,
  LedgerService,
  VerifyLedgerAddressHandler,
  AddLedgerAddressHandler,
  RemoveLedgerAddressHandler,
  isKeystoreUnlocked,
  KeystoreWalletsUI$,
  RemovedKeystoreId$,
  KeystoreLedgerAddress,
  KeystoreLedgerAddressesLD
} from './types'
import { fromIPCKeystoresLedgerAddressesIO, toIPCKeystoresLedgerAddressesIO } from './util'

export const createLedgerService = ({
  keystore$,
  wallets$,
  network$
}: {
  keystore$: KeystoreState$
  wallets$: KeystoreWalletsUI$
  network$: Network$
}): LedgerService => {
  /**
   * State of all Ledger addresses added to a keystore wallet
   * Note: Only ONE Ledger for a Keystore / Chain / Network combo possible
   */
  const {
    get$: keystoreLedgerAddresses$,
    get: keystoreLedgerAddresses,
    set: setKeystoreLedgerAddresses
  } = observableState<KeystoreLedgerAddresses>(INITIAL_KEYSTORE_LEDGER_ADDRESSES)

  const saveKeystoreLedgerAddresses = (addresses: KeystoreLedgerAddresses): KeystoreLedgerAddressesLD =>
    FP.pipe(
      setKeystoreLedgerAddresses(addresses),
      () => toIPCKeystoresLedgerAddressesIO(addresses),
      (ioAddresses) => Rx.from(window.apiHDWallet.saveLedgerAddresses(ioAddresses)),
      RxOp.map(RD.fromEither),
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
      liveData.map(fromIPCKeystoresLedgerAddressesIO),
      RxOp.startWith(RD.pending)
    )

  const selectedKeystoreId$: Rx.Observable<O.Option<KeystoreId>> = FP.pipe(
    keystore$,
    // Check unlocked keystore only
    RxOp.map(FP.flow(O.chain(O.fromPredicate(isKeystoreUnlocked)))),
    RxOp.map(FP.flow(O.map(({ id }) => id))),
    RxOp.distinctUntilChanged(),
    RxOp.shareReplay(1)
  )

  /**
   * Stream of removed `KeystoreId`s
   * by comparing changes of `KeystoreWalletsUI[]`
   */
  const removedKeystoreId$: RemovedKeystoreId$ = FP.pipe(
    wallets$,
    // get prev. + curr. `KeystoreWalletsUI[]`
    RxOp.pairwise(),
    // Transform pair of `KeystoreWalletsUI[]` to pair of `KeystoreId[]`
    RxOp.map((pair) => FP.pipe(pair, A.map(FP.flow(A.map(({ id }) => id))))),
    RxOp.map(([prev, curr]) =>
      // get's the difference
      FP.pipe(prev, A.difference(N.Eq)(curr), A.head)
    )
  )

  /**
   * Stream of Ledger addresses depending on selected keystoreId + network
   */
  const ledgerAddresses$ = FP.pipe(
    Rx.combineLatest([network$, selectedKeystoreId$, keystoreLedgerAddresses$]),
    RxOp.map(([network, oKeystoreId, addresses]) =>
      FP.pipe(
        oKeystoreId,
        O.fold(
          () => INITIAL_KEYSTORE_LEDGER_ADDRESSES,
          (id) =>
            FP.pipe(
              addresses,
              A.map((v) => v),
              A.filter(
                ({ keystoreId, network: n }) => eqKeystoreId.equals(id, keystoreId) && eqNetwork.equals(n, network)
              )
            )
        )
      )
    ),
    RxOp.startWith(INITIAL_KEYSTORE_LEDGER_ADDRESSES)
  )

  /**
   * Update address by given chain, network, keystoreId
   */
  const _addLedgerAddress = (address: KeystoreLedgerAddress): KeystoreLedgerAddressesLD => {
    const { chain, network, keystoreId } = address
    return FP.pipe(
      keystoreLedgerAddresses(),
      // remove same entry if available just to avoid duplication
      A.filter(
        ({ chain: c, network: n, keystoreId: id }) =>
          !(eqKeystoreId.equals(id, keystoreId) && eqChain.equals(c, chain) && eqNetwork.equals(n, network))
      ),
      A.prepend(address),
      saveKeystoreLedgerAddresses
    )
  }

  /**
   * Stream to get ledger address from memory
   */
  const getLedgerAddress$: GetKeystoreLedgerAddressHandler = (chain: Chain) =>
    FP.pipe(
      ledgerAddresses$,
      RxOp.map(
        (addresses) =>
          FP.pipe(
            addresses,
            A.findFirst(({ chain: c }) => eqChain.equals(c, chain))
          ),
        RxOp.distinctUntilChanged(eqOKeystoreLedgerAddress.equals)
      )
    )

  const verifyLedgerAddress$: VerifyLedgerAddressHandler = ({ chain, network, walletIndex, ethDerivationMode }) =>
    FP.pipe(
      Rx.from(
        window.apiHDWallet.verifyLedgerAddress({
          chain,
          network,
          walletIndex,
          ethDerivationMode: O.toUndefined(ethDerivationMode)
        })
      ),
      RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
      RxOp.switchMap((verified) =>
        Rx.of(verified ? RD.success(true) : RD.failure(Error(`Could not verify Ledger for ${chain}`)))
      ),
      RxOp.startWith(RD.pending)
    )

  /**
   * Removes ledger address from `keystoreLedgerAddresses` list
   */
  const removeLedgerAddress: RemoveLedgerAddressHandler = ({ id, chain, network }) =>
    FP.pipe(
      keystoreLedgerAddresses(),
      A.filter(
        ({ chain: c, network: n, keystoreId }) =>
          !(eqKeystoreId.equals(id, keystoreId) && eqChain.equals(c, chain) && eqNetwork.equals(n, network))
      ),
      saveKeystoreLedgerAddresses
    )

  /**
   * Add Ledger by asking address from it
   */
  const addLedgerAddress$: AddLedgerAddressHandler = ({ id, chain, network, ethDerivationMode, walletIndex }) =>
    FP.pipe(
      Rx.from(
        window.apiHDWallet.getLedgerAddress({
          chain,
          network,
          walletIndex,
          ethDerivationMode: O.toUndefined(ethDerivationMode)
        })
      ),
      RxOp.map(RD.fromEither),
      RxOp.catchError((error) =>
        Rx.of(
          RD.failure({
            errorId: LedgerErrorId.GET_ADDRESS_FAILED,
            msg: isError(error) ? error?.message ?? error.toString() : `${error}`
          })
        )
      ),
      liveData.map<WalletAddress, KeystoreLedgerAddress>(({ address }) => {
        const ledgerAddress: KeystoreLedgerAddress = {
          keystoreId: id,
          chain,
          network,
          ethDerivationMode,
          walletIndex,
          address
        }
        // store address in memory
        _addLedgerAddress(ledgerAddress)
        return ledgerAddress
      }),
      RxOp.startWith(RD.pending)
    )

  // Whenever a keystore have been removed, remove its related ledger addresses
  removedKeystoreId$.subscribe((oKeystoreId: O.Option<KeystoreId>) =>
    FP.pipe(
      oKeystoreId,
      O.map((id) =>
        FP.pipe(
          keystoreLedgerAddresses(),
          A.filter(({ keystoreId }) => keystoreId !== id),
          saveKeystoreLedgerAddresses
        )
      )
    )
  )

  // `TriggerStream` to reload persistent `KeystoreLedgerAddresses`
  const { stream$: reloadPersistentLedgerAddresses$, trigger: reloadPersistentLedgerAddresses } = triggerStream()

  /**
   * Persistent `KeystoreWallets` stored on disc.
   */
  const persistentLedgerAddresses$: KeystoreLedgerAddressesLD = FP.pipe(
    reloadPersistentLedgerAddresses$,
    RxOp.switchMap(() => Rx.from(window.apiHDWallet.getLedgerAddresses())),
    RxOp.map(RD.fromEither),
    RxOp.catchError((error: Error) => Rx.of(RD.failure(error))),
    liveData.map(fromIPCKeystoresLedgerAddressesIO),
    RxOp.startWith(RD.pending),
    RxOp.shareReplay(1)
  )

  // Subscribe keystoreLedgersPersistent$
  // to update internal `KeystoreLedgerAddresses`
  // whenever data are loaded from disc,
  persistentLedgerAddresses$.subscribe((ledgersRD) =>
    FP.pipe(
      ledgersRD,
      RD.map((ledgers) => {
        setKeystoreLedgerAddresses(ledgers)
        return true
      })
    )
  )

  // TODO(@Veado) Remove it - for debugging only
  ledgerAddresses$.subscribe((v) => console.log('ledgerAddresses$ sub', v))
  keystoreLedgerAddresses$.subscribe((v) => console.log('keystoreLedgerAddresses$ sub', v))
  removedKeystoreId$.subscribe((v) => console.log('removedKeystoreId$ sub', v))

  return {
    ledgerAddresses$,
    addLedgerAddress$,
    getLedgerAddress$,
    verifyLedgerAddress$,
    removeLedgerAddress,
    reloadPersistentLedgerAddresses,
    persistentLedgerAddresses$
  }
}
