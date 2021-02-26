import { BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'

import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as LTC from '../../litecoin'
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
    case BNBChain:
      BNB.reloadFees()
      break
    case BTCChain:
      BTC.reloadFees()
      break
    case ETHChain:
      // not available yet
      break
    case THORChain:
      THOR.reloadFees()
      break
    case LTCChain:
      LTC.reloadFees()
      break
    default:
  }
}
