import * as RD from '@devexperts/remote-data-ts'
import { Fees } from '@xchainjs/xchain-client'
import { Chain, Asset, BNBChain, THORChain, BTCChain, ETHChain, baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'

import { getChainAsset } from '../../../helpers/chainHelper'
import { LiveData, liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { FeesLD, SwapFeesLDS } from '../types'

const reloadSwapFees = () => {
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

type SwapFeeType = 'source' | 'target'

const swapFee$ = (asset: Asset, type: SwapFeeType): LiveData<Error, BaseAmount> => {
  const feeByChain$: LiveData<Error, Fees> = feesByChain$(getChainAsset(asset.chain).chain)

  const multiplier = type === 'source' ? 1 : 3

  return FP.pipe(
    feeByChain$,
    liveData.map((fees) => fees.fastest),
    liveData.map((fee) => baseAmount(fee.amount().times(multiplier), fee.decimal))
  )
}

const swapFees$ = (sourceAsset: Asset, targetAsset: Asset): SwapFeesLDS => ({
  source: swapFee$(sourceAsset, 'source'),
  target: swapFee$(targetAsset, 'target')
})

export { reloadSwapFees, swapFees$ }
