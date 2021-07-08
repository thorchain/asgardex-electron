import {
  Asset,
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { GetExplorerTxUrl$ } from '../clients'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as THOR from '../thorchain'

const explorerUrlFailure$ = Rx.of(O.none)

/**
 * Cain-based Explorer url depending on selected network
 */
const getExplorerUrlByAsset$ = (asset: Asset | null): GetExplorerTxUrl$ => {
  if (asset === null) {
    return explorerUrlFailure$
  }
  switch (asset.chain) {
    case BNBChain:
      return BNB.getExplorerTxUrl$
    case BTCChain:
      return BTC.getExplorerTxUrl$
    case ETHChain:
      return ETH.getExplorerTxUrl$
    case THORChain:
      return THOR.getExplorerTxUrl$
    case CosmosChain:
      // not available yet
      return explorerUrlFailure$
    case PolkadotChain:
      // not available yet
      return explorerUrlFailure$
    case BCHChain:
      return BCH.getExplorerTxUrl$
    case LTCChain:
      return LTC.getExplorerTxUrl$
  }
}

export { getExplorerUrlByAsset$ }
