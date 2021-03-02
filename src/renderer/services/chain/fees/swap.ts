import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo } from '@thorchain/asgardex-util'
import { Fees } from '@xchainjs/xchain-client'
import {
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
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeesLD, Memo, SwapFeesLD } from '../types'

const reloadSwapFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
  ETH.reloadFees()
  THOR.reloadFees()
  LTC.reloadFees()
}

const feesByChain$ = (asset: Asset, memo?: Memo, amount?: BaseAmount, recipient?: string): FeesLD => {
  const chain = getChainAsset(asset.chain).chain
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
      if (amount && recipient) {
        return FP.pipe(
          ETH.fees$({
            asset,
            amount,
            recipient,
            memo
          }),
          liveData.map((fees) => fees)
        )
      }

      return Rx.of(RD.failure(Error('Amount and recipient are required fields')))

    case CosmosChain:
      return Rx.of(RD.failure(Error('Cosmos fees is not implemented yet')))

    case PolkadotChain:
      return Rx.of(RD.failure(Error('Polkadot fees is not implemented yet')))

    case BCHChain:
      return Rx.of(RD.failure(Error('Bitcoincash fees is not implemented yet')))

    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.map(({ fees }) => fees)
      )
  }
}

type SwapFeeType = 'source' | 'target'

const swapFee$ = (
  asset: Asset,
  type: SwapFeeType,
  memo?: Memo,
  amount?: BaseAmount,
  recipient?: string
): LiveData<Error, BaseAmount> => {
  const feeByChain$: LiveData<Error, Fees> = feesByChain$(asset, memo, amount, recipient)

  const multiplier = type === 'source' ? 1 : 3

  return FP.pipe(
    feeByChain$,
    liveData.map((fees) => fees.fastest),
    liveData.map((fee) => baseAmount(fee.amount().times(multiplier), fee.decimal))
  )
}

const swapFees$ = (sourceAsset: Asset, targetAsset: Asset, amount?: BaseAmount, recipient?: string): SwapFeesLD => {
  return liveData.sequenceS({
    source: swapFee$(sourceAsset, 'source', getSwapMemo({ asset: sourceAsset }), amount, recipient),
    target: swapFee$(targetAsset, 'target')
  })
}

export { reloadSwapFees, swapFees$ }
