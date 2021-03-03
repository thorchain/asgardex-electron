import * as RD from '@devexperts/remote-data-ts'
import { Fees } from '@xchainjs/xchain-client'
import {
  Chain,
  Asset,
  BNBChain,
  THORChain,
  BTCChain,
  baseAmount,
  BaseAmount,
  ETHChain,
  CosmosChain,
  PolkadotChain,
  BCHChain,
  LTCChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'

import { getChainAsset } from '../../../helpers/chainHelper'
import { getSwapMemo } from '../../../helpers/memoHelper'
import { LiveData, liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeesLD, Memo, SwapFeesLD } from '../types'

const reloadSwapFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
  THOR.reloadFees()
  LTC.reloadFees()
  BCH.reloadFees()
}

const feesByChain$ = (chain: Chain, memo?: Memo): FeesLD => {
  switch (chain) {
    case BNBChain:
      return BNB.fees$()

    case THORChain:
      return THOR.fees$()

    case BTCChain:
      return FP.pipe(
        BTC.feesWithRates$(memo),
        liveData.map((btcFees) => btcFees.fees)
      )

    case ETHChain:
      return Rx.of(RD.failure(Error('ETH fees is not implemented yet')))

    case CosmosChain:
      return Rx.of(RD.failure(Error('Cosmos fees is not implemented yet')))

    case PolkadotChain:
      return Rx.of(RD.failure(Error('Polkadot fees is not implemented yet')))

    case BCHChain:
      return FP.pipe(
        BCH.feesWithRates$(memo),
        liveData.map(({ fees }) => fees)
      )

    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.map(({ fees }) => fees)
      )
  }
}

type SwapFeeType = 'source' | 'target'

const swapFee$ = (asset: Asset, type: SwapFeeType, memo?: Memo): LiveData<Error, BaseAmount> => {
  const feeByChain$: LiveData<Error, Fees> = feesByChain$(getChainAsset(asset.chain).chain, memo)

  const multiplier = type === 'source' ? 1 : 3

  return FP.pipe(
    feeByChain$,
    liveData.map((fees) => fees.fastest),
    liveData.map((fee) => baseAmount(fee.amount().times(multiplier), fee.decimal))
  )
}

const swapFees$ = (sourceAsset: Asset, targetAsset: Asset): SwapFeesLD => {
  return liveData.sequenceS({
    source: swapFee$(sourceAsset, 'source', getSwapMemo(sourceAsset)),
    target: swapFee$(targetAsset, 'target')
  })
}

export { reloadSwapFees, swapFees$ }
