import * as BTC from '../bitcoin'
import { LedgerGetAddressParams } from './types'

const retrieveLedgerAddress = ({ chain }: LedgerGetAddressParams): void => {
  switch (chain) {
    case 'BTC':
      return BTC.retrieveLedgerAddress()
  }
}

export { retrieveLedgerAddress }
