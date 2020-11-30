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

const resetLedgerAddress = ({ chain, network }: LedgerAddressParams): void => {
  switch (chain) {
    case 'BTC':
      return BTC.resetLedgerAddress(network)
    default:
      break
  }
}

export { retrieveLedgerAddress, resetLedgerAddress }
