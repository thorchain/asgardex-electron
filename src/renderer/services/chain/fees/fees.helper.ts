import { Chain } from '@thorchain/asgardex-util'

import * as BNB from '../../binance/service'
import * as BTC from '../../bitcoin/context'

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
