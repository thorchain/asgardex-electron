import { Chain } from '@xchainjs/xchain-util'

import * as BTC from '../bitcoin'
import { LedgerAddressParams } from './types'

const retrieveLedgerAddress = ({ chain }: LedgerAddressParams): void => {
  switch (chain) {
    case 'BTC':
      return BTC.retrieveLedgerAddress()
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

export { retrieveLedgerAddress, removeLedgerAddress }
