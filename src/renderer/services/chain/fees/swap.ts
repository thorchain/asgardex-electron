import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo } from '@thorchain/asgardex-util'
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
import { LiveData, liveData } from '../../../helpers/rx/liveData'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as THOR from '../../thorchain'
import { FeesLD, Memo, SwapFeesLD } from '../types'

const reloadSwapFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
  THOR.reloadFees()
}

const feesByChain$ = (chain: Chain, memo?: Memo): FeesLD => {
  switch (chain) {
    case BNBChain:
      return BNB.fees$()

    case THORChain:
      return THOR.fees$()

    case BTCChain:
      return FP.pipe(
        /**
         * SWAP memo includes only target asset info so
         * there will not be any memo in case BTC is a targetAsset
         */
        memo ? BTC.memoFees$(memo) : BTC.fees$,
        liveData.map((btcFees) => btcFees.fees)
      )

    case ETHChain:
      return Rx.of(RD.failure(Error('ETH fees is not implemented yet')))

    case CosmosChain:
      return Rx.of(RD.failure(Error('Cosmos fees is not implemented yet')))

    case PolkadotChain:
      return Rx.of(RD.failure(Error('Polkadot fees is not implemented yet')))

    case BCHChain:
      return Rx.of(RD.failure(Error('Bitcoincash fees is not implemented yet')))

    case LTCChain:
      return Rx.of(RD.failure(Error('Litecoin fees is not implemented yet')))
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
    source: swapFee$(sourceAsset, 'source', getSwapMemo({ asset: sourceAsset })),
    target: swapFee$(targetAsset, 'target')
  })
}

export { reloadSwapFees, swapFees$ }
