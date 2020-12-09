import * as RD from '@devexperts/remote-data-ts'
import { Chain, Asset, BNBChain, THORChain, BTCChain, ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'

import { liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { FeesLD } from '../types'

const reloadChainFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
  THOR.reloadFees()
}

/**
 * @todo rethink about using common fees at all views
 * and move view-related calculations directly to the views
 * instead of creating fee-services for every situations
 */
const feesByChain$ = (chain: Chain): FeesLD => {
  switch (chain) {
    case BNBChain:
      return BNB.fees$

    case THORChain:
      return THOR.fees$

    case BTCChain:
      return FP.pipe(
        BTC.fees$,
        liveData.map((btcFees) => btcFees.fees)
      )
    case ETHChain:
      return Rx.of(RD.failure(Error(`${chain.toUpperCase} fees is not implemented yet`)))
  }
}

const feesByAssetChain$ = ({ chain }: Asset): FeesLD => feesByChain$(chain)

export { reloadChainFees, feesByAssetChain$ }
