import { Chain } from '@xchainjs/xchain-util'

import * as BTC from '../bitcoin'
import { LedgerAddressParams } from './types'

const retrieveLedgerAddress = ({ chain, network }: LedgerAddressParams): void => {
  switch (chain) {
    case 'BTC':
      return BTC.retrieveLedgerAddress(network)
    default:
      break
  }
}

const removeLedgerAddress = (chain: Chain): void => {
  switch (chain) {
    case 'BTC':
      return BTC.removeLedgerAddress()
    default:
      break
  }
}

const removeAllLedgerAddress = (): void => {
  BTC.removeLedgerAddress()
  // add more removeLedgerAddress later
}

export { retrieveLedgerAddress, removeLedgerAddress, removeAllLedgerAddress }
