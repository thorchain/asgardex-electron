import { Chain } from '@xchainjs/xchain-util'

import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'

/**
 * @description
 * As some of fees' streams have shareReplay(1) re-subscribing to that
 * streams will affect nothing (instead of re-requesting data). They
 * demand manual updating by triggering their own triggeStrams.
 *
 * @example
 * reloadDepositFeesEffect$ at ./deposit.ts
 */
export const reloadDepositFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      BNB.reloadFees()
      break
    case 'BTC':
      BTC.reloadFees()
      break
    case 'ETH':
      // not available yet
      break
    case 'THOR':
      THOR.reloadFees()
      break
    default:
  }
}
