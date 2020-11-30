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

const resetLedgerAddress = (chain: Chain): void => {
  switch (chain) {
    case 'BTC':
      return BTC.resetLedgerAddress()
    default:
      break
  }
}

const resetAllLedgerAddress = (): void => {
  BTC.resetLedgerAddress()
  // add more resetLedgerAddress later
}

export { retrieveLedgerAddress, resetLedgerAddress, resetAllLedgerAddress }
