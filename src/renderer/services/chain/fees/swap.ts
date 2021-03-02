import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo } from '@thorchain/asgardex-util'
import { Address, Fees } from '@xchainjs/xchain-client'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
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
import { FeeLD, FeesLD, Memo } from '../types'

const reloadSwapFees = ({ asset, amount, recipient }: { asset?: Asset; amount?: BaseAmount; recipient?: Address }) => {
  const memo = asset ? getSwapMemo({ asset }) : ''
  // TODO: Don't call all handlers, just for source + target asset
  BNB.reloadFees()
  BTC.reloadFeesWithRates(memo)
  ETH.reloadFees({ asset, memo, amount: amount || baseAmount(1), recipient: recipient || ETHAddress })
  THOR.reloadFees()
  LTC.reloadFeesWithRates(memo)
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
      return FP.pipe(
        // TODO Check why we do need default values
        ETH.fees$({
          asset,
          amount: amount || baseAmount(1),
          recipient: recipient || ETHAddress,
          memo
        }),
        liveData.map((fees) => fees)
      )

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

const swapFee$ = ({ asset, amount, recipient }: { asset: Asset; amount?: BaseAmount; recipient?: Address }): FeeLD => {
  const memo = getSwapMemo({ asset })
  const feesLD: LiveData<Error, Fees> = feesByChain$(asset, memo, amount, recipient)

  return FP.pipe(
    feesLD,
    liveData.map((fees) => fees.fastest),
    liveData.map((fee) => baseAmount(fee.amount(), fee.decimal))
  )
}

export { reloadSwapFees, swapFee$ }
