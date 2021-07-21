import { BNBChain, BTCChain, Chain } from '@xchainjs/xchain-util'

import { GetLedgerAddressParams } from '../../../shared/api/types'
import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'

const retrieveLedgerAddress = ({ chain, network, index }: GetLedgerAddressParams): void => {
  switch (chain) {
    case BTCChain:
      return BTC.retrieveLedgerAddress(network, index)
    case BNBChain:
      return BNB.retrieveLedgerAddress(network, index)
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
