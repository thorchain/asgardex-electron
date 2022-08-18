import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { KeystoreId, LedgerErrorId, Network } from '../../../shared/api/types'
import { isError } from '../../../shared/utils/guard'
import { eqLedgerAddressMap } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { INITIAL_KEYSTORE_LEDGER_ADDRESSES_MAP, INITIAL_LEDGER_ADDRESSES_MAP } from './const'
import {
  GetLedgerAddressHandler,
  KeystoreState,
  KeystoreState$,
  KeystoreLedgerAddressesMap,
  LedgerAddressesMap,
  LedgerAddressRD,
  LedgerService,
  VerifyLedgerAddressHandler,
  AskLedgerAddressesHandler,
  RemoveLedgerAddressHandler,
  isKeystoreUnlocked
} from './types'
import { hasImportedKeystore } from './util'

export const createLedgerService = ({ keystore$ }: { keystore$: KeystoreState$ }): LedgerService => {
  // State of all Ledger addresses added to a keystore wallet
  const {
    get$: keystoreLedgerAddresses$,
    get: keystoreLedgerAddresses,
    set: setKeystoreLedgerAddresses
  } = observableState<KeystoreLedgerAddressesMap>(INITIAL_KEYSTORE_LEDGER_ADDRESSES_MAP)

  const selectedKeystoreId$: Rx.Observable<O.Option<KeystoreId>> = FP.pipe(
    keystore$,
    // Check unlocked keystore only
    RxOp.map(FP.flow(O.chain(O.fromPredicate(isKeystoreUnlocked)))),
    RxOp.map(FP.flow(O.map(({ id }) => id))),
    RxOp.distinctUntilChanged(),
    RxOp.shareReplay(1)
  )

  const ledgerAddresses = (id: KeystoreId): LedgerAddressesMap =>
    FP.pipe(
      keystoreLedgerAddresses().get(id),
      O.fromNullable,
      O.getOrElse(() => INITIAL_LEDGER_ADDRESSES_MAP)
    )

  const ledgerAddresses$ = FP.pipe(
    Rx.combineLatest([selectedKeystoreId$, keystoreLedgerAddresses$]),
    RxOp.map(([oKeystoreId, addressesMap]) =>
      FP.pipe(
        oKeystoreId,
        O.fold(
          () => INITIAL_LEDGER_ADDRESSES_MAP,
          (id) =>
            FP.pipe(
              addressesMap.get(id),
              O.fromNullable,
              O.getOrElse(() => INITIAL_LEDGER_ADDRESSES_MAP)
            )
        )
      )
    ),
    RxOp.startWith(INITIAL_LEDGER_ADDRESSES_MAP)
  )

  const setLedgerAddresses = (id: KeystoreId, addressesMap: LedgerAddressesMap) => {
    const updated = keystoreLedgerAddresses().set(id, addressesMap)
    setKeystoreLedgerAddresses(updated)
  }

  const setLedgerAddressRD = ({
    addressRD,
    chain,
    network,
    id
  }: {
    addressRD: LedgerAddressRD
    chain: Chain
    network: Network
    id: KeystoreId
  }) => {
    const addresses = ledgerAddresses(id)
    return setLedgerAddresses(id, { ...addresses, [chain]: { ...addresses[chain], [network]: addressRD } })
  }

  /**
   * Get ledger address from memory
   */
  const getLedgerAddress$: GetLedgerAddressHandler = (chain, network) =>
    FP.pipe(
      ledgerAddresses$,
      RxOp.map((addressesMap) => addressesMap[chain]),
      RxOp.distinctUntilChanged(eqLedgerAddressMap.equals),
      RxOp.map((addressMap) => addressMap[network])
    )

  const verifyLedgerAddress: VerifyLedgerAddressHandler = async ({ chain, network, walletIndex }) =>
    window.apiHDWallet.verifyLedgerAddress({ chain, network, walletIndex })

  /**
   * Removes ledger address from memory
   */
  const removeLedgerAddress: RemoveLedgerAddressHandler = ({ id, chain, network }) =>
    setLedgerAddressRD({
      addressRD: RD.initial,
      chain,
      network,
      id
    })

  /**
   * Sets ledger address in `pending` state
   */
  const setPendingLedgerAddress = ({ id, chain, network }: { id: KeystoreId; chain: Chain; network: Network }): void =>
    setLedgerAddressRD({
      id,
      addressRD: RD.pending,
      chain,
      network
    })

  /**
   * Ask Ledger to get address from it
   */
  const askLedgerAddress$: AskLedgerAddressesHandler = ({ id, chain, network, walletIndex }) =>
    FP.pipe(
      // remove address from memory
      removeLedgerAddress({ id, chain, network }),
      // set pending
      () => setPendingLedgerAddress({ id, chain, network }),
      // ask for ledger address
      () => Rx.from(window.apiHDWallet.getLedgerAddress({ chain, network, walletIndex })),
      RxOp.map(RD.fromEither),
      // store address in memory
      RxOp.tap((addressRD: LedgerAddressRD) => setLedgerAddressRD({ chain, addressRD, network, id })),
      RxOp.catchError((error) =>
        Rx.of(
          RD.failure({
            errorId: LedgerErrorId.GET_ADDRESS_FAILED,
            msg: isError(error) ? error?.message ?? error.toString() : `${error}`
          })
        )
      ),
      RxOp.startWith(RD.pending)
    )

  // Whenever all keystores have been removed, reset all stored ledger addresses
  keystore$.subscribe((keystoreState: KeystoreState) => {
    if (!hasImportedKeystore(keystoreState)) {
      setKeystoreLedgerAddresses(INITIAL_KEYSTORE_LEDGER_ADDRESSES_MAP)
    }
  })

  // TODO(@Veado) Remove it - for debugging only
  ledgerAddresses$.subscribe((v) => console.log('ledgerAddresses subscription', v))

  return {
    ledgerAddresses$,
    askLedgerAddress$,
    getLedgerAddress$,
    verifyLedgerAddress,
    removeLedgerAddress
  }
}
