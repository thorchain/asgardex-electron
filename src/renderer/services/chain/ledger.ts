import { BNBChain, BTCChain, Chain } from '@xchainjs/xchain-util'

import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { LedgerAddressParams } from './types'

const retrieveLedgerAddress = ({ chain, network }: LedgerAddressParams): void => {
  switch (chain) {
    case BTCChain:
      return BTC.retrieveLedgerAddress(network)
    case BNBChain:
      return BNB.retrieveLedgerAddress(network)
    default:
      break
  }
}

const removeLedgerAddress = (chain: Chain): void => {
  switch (chain) {
    case BTCChain:
      return BTC.removeLedgerAddress()
    case BNBChain:
      return BNB.removeLedgerAddress()
    default:
      break
  }
}

const removeAllLedgerAddress = (): void => {
  BTC.removeLedgerAddress()
  BNB.removeLedgerAddress()
  // add more removeLedgerAddress later
}

network$.subscribe(removeAllLedgerAddress)

export { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress }
