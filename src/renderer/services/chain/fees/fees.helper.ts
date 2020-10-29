import { Chain } from '@thorchain/asgardex-util'

import * as BNB from '../../binance/service'
import * as BTC from '../../bitcoin/context'

/**
 * @description
 * As some of fees' streams have shareReplay(1) re-subscribing to that
 * streams will affect nothing (instead of re-requesting data). They
 * demand manual updating by triggering their own triggeStrams.
 *
 * @example
 * updateUnstakeFeesEffect$ at ./withdraw.ts
 * @example
 * updateStakeFeesEffect$ at ./stake.ts
 */
export const reloadStakeFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      BNB.reloadFees()
      break
    case 'BTC':
      BTC.reloadStakeFee()
      break
    case 'ETH':
      // not available yet
      break
    case 'THOR':
      // not available yet
      break
    default:
  }
}
