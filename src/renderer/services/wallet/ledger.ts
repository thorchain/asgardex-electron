import * as RD from '@devexperts/remote-data-ts'
import { Chain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { network$ } from '../app/service'
import * as THOR from '../thorchain/ledger'
import { LedgerAddressLD, LedgerAddressRD } from './types'

/**
 * Get ledger address from memory
 */
export const getLedgerAddressByChain$ = (chain: Chain): LedgerAddressLD => {
  switch (chain) {
    case THORChain:
      return THOR.ledgerAddress$
    default:
      throw Error(`Ledger has not been implemented for ${chain} yet`)
  }
}

/**
 * Get ledger address from memory
 */
export const removeLedgerAddressByChain = (chain: Chain): void => {
  switch (chain) {
    case THORChain:
      return THOR.setLedgerAddressRD(RD.initial)
    default:
      throw Error(`Ledger has not been implemented for ${chain} yet`)
  }
}

const removeAllLedgerAddresses = (): void => {
  removeLedgerAddressByChain(THORChain)
}

// Remove all Ledger addresses while changing the network
network$.subscribe(removeAllLedgerAddresses)

/**
 * Get ledger address from memory
 */
const pendingLedgerAddressByChain = (chain: Chain): void => {
  switch (chain) {
    case THORChain:
      return THOR.setLedgerAddressRD(RD.pending)
    default:
      throw Error(`Ledger has not been implemented for ${chain} yet`)
  }
}

const setLedgerAddressByChain = (chain: Chain, address: LedgerAddressRD) => {
  switch (chain) {
    case THORChain:
      return THOR.setLedgerAddressRD(address)
    default:
      throw Error(`Ledger has not been implemented for ${chain} yet`)
  }
}

/**
 * Ask Ledger to get address from it
 */
export const askLedgerAddressByChain$ = (chain: Chain, network: Network): LedgerAddressLD =>
  FP.pipe(
    // remove address from memory
    removeLedgerAddressByChain(chain),
    // set pending
    () => pendingLedgerAddressByChain(chain),
    // ask for ledger address
    () => Rx.from(window.apiHDWallet.getLedgerAddress(chain, network)),
    RxOp.map(RD.fromEither),
    // store address in memory
    RxOp.tap((address: LedgerAddressRD) => setLedgerAddressByChain(chain, address)),
    RxOp.catchError((error) => Rx.of(RD.failure(error))),
    RxOp.startWith(RD.pending)
  )
