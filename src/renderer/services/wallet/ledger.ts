import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { IntlShape } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { eqLedgerAddressMap } from '../../helpers/fp/eq'
import { observableState } from '../../helpers/stateHelper'
import { INITIAL_LEDGER_ADDRESSES_MAP } from './const'
import { LedgerAddressesMap, LedgerAddressLD, LedgerAddressRD } from './types'

// State of all added Ledger addresses
const {
  get$: ledgerAddresses$,
  get: ledgerAddresses,
  set: setLedgerAddresses
} = observableState<LedgerAddressesMap>(INITIAL_LEDGER_ADDRESSES_MAP)

const setLedgerAddressRD = ({
  addressRD,
  chain,
  network
}: {
  addressRD: LedgerAddressRD
  chain: Chain
  network: Network
}) => {
  const addresses = ledgerAddresses()
  // TODO(@asgdx-team) Let's think about to use `immer` or similar library for deep, immutable state changes
  return setLedgerAddresses({ ...addresses, [chain]: { ...addresses[chain], [network]: addressRD } })
}

/**
 * Get ledger address from memory
 */
export const getLedgerAddress$ = (chain: Chain, network: Network): LedgerAddressLD =>
  FP.pipe(
    ledgerAddresses$,
    RxOp.map((addressesMap) => addressesMap[chain]),
    RxOp.distinctUntilChanged(eqLedgerAddressMap.equals),
    RxOp.map((addressMap) => addressMap[network])
  )

/**
 * Removes ledger address from memory
 */
export const removeLedgerAddress = (chain: Chain, network: Network): void =>
  setLedgerAddressRD({
    addressRD: RD.initial,
    chain,
    network
  })

/**
 * Sets ledger address in `pending` state
 */
const setPendingLedgerAddress = (chain: Chain, network: Network): void =>
  setLedgerAddressRD({
    addressRD: RD.pending,
    chain,
    network
  })

/**
 * Ask Ledger to get address from it
 */
export const askLedgerAddress$ = (chain: Chain, network: Network): LedgerAddressLD =>
  FP.pipe(
    // remove address from memory
    removeLedgerAddress(chain, network),
    // set pending
    () => setPendingLedgerAddress(chain, network),
    // ask for ledger address
    () => Rx.from(window.apiHDWallet.getLedgerAddress(chain, network)),
    RxOp.map(RD.fromEither),
    // store address in memory
    RxOp.tap((addressRD: LedgerAddressRD) => setLedgerAddressRD({ chain, addressRD, network })),
    RxOp.catchError((error) => Rx.of(RD.failure(error))),
    RxOp.startWith(RD.pending)
  )

export const ledgerErrorIdToI18n = (errorId: LedgerErrorId, intl: IntlShape) => {
  switch (errorId) {
    case LedgerErrorId.NO_DEVICE:
      return intl.formatMessage({ id: 'ledger.error.nodevice' })
    case LedgerErrorId.ALREADY_IN_USE:
      return intl.formatMessage({ id: 'ledger.error.inuse' })
    case LedgerErrorId.NO_APP:
      return intl.formatMessage({ id: 'ledger.error.noapp' })
    case LedgerErrorId.WRONG_APP:
      return intl.formatMessage({ id: 'ledger.error.wrongapp' })
    case LedgerErrorId.DENIED:
      return intl.formatMessage({ id: 'ledger.error.denied' })
    // default is similar to LedgerErrorId.UNKNOWN
    default:
      return intl.formatMessage({ id: 'ledger.error.unknown' })
  }
}
