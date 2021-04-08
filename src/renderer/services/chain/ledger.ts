import { Chain } from '@xchainjs/xchain-util'

import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { LedgerAddressParams } from './types'

const retrieveLedgerAddress = ({ chain, network }: LedgerAddressParams): void => {
  switch (chain) {
    case 'BTC':
      return BTC.retrieveLedgerAddress(network)
    case 'BNB':
      return BNB.retrieveLedgerAddress(network)
    default:
      break
  }
}

const removeLedgerAddress = (chain: Chain): void => {
  switch (chain) {
    case 'BTC':
      return BTC.removeLedgerAddress()
    case 'BNB':
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
