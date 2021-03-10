import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import {
  BNBChain,
  THORChain,
  BTCChain,
  baseAmount,
  ETHChain,
  CosmosChain,
  PolkadotChain,
  BCHChain,
  LTCChain
} from '@xchainjs/xchain-util'
import { ethers } from 'ethers'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthTokenAddress, isEthAsset } from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqChain } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import { ethRouterABI } from '../../const'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeeLD, SwapFeeParams, SwapFeesHandler, SwapFeesParams } from '../types'

const swapFeeByChain$ = ({
  asset,
  memo,
  amount,
  recipient,
  routerAddress,
  type
}: SwapFeeParams & { type: 'source' | 'target' }): FeeLD => {
  const router = type === 'source' ? FP.pipe(routerAddress, O.toUndefined) : undefined
  const chain = getChainAsset(asset.chain).chain
  const FEE_OPTION_KEY: FeeOptionKey = 'fast'
  console.log({
    asset,
    memo,
    amount,
    recipient,
    routerAddress,
    type
  })
  switch (chain) {
    case BNBChain:
      return FP.pipe(
        BNB.fees$(),
        liveData.map((fees) => fees[FEE_OPTION_KEY])
      )

    case THORChain:
      return FP.pipe(
        THOR.fees$(),
        liveData.map((fees) => fees[FEE_OPTION_KEY])
      )

    case BTCChain:
      return FP.pipe(
        BTC.feesWithRates$(memo),
        liveData.map((btcFees) => btcFees.fees[FEE_OPTION_KEY])
      )

    case ETHChain: {
      return FP.pipe(
        type === 'source' && router
          ? ETH.callFees$(
              router,
              ethRouterABI,
              'deposit',
              isEthAsset(asset)
                ? [
                    ethers.utils.getAddress(recipient.toLowerCase()),
                    ETHAddress,
                    0,
                    memo,
                    {
                      value: amount.amount().toFixed()
                    }
                  ]
                : [
                    ethers.utils.getAddress(recipient.toLowerCase()),
                    FP.pipe(getEthTokenAddress(asset), O.toUndefined),
                    amount.amount().toFixed(),
                    memo
                  ]
            )
          : ETH.fees$({
              asset,
              amount,
              recipient,
              memo
            }),
        liveData.map((fees) => fees[FEE_OPTION_KEY])
      )
    }
    case CosmosChain:
      return Rx.of(RD.failure(Error('Cosmos fees is not implemented yet')))

    case PolkadotChain:
      return Rx.of(RD.failure(Error('Polkadot fees is not implemented yet')))

    case BCHChain:
      return FP.pipe(
        BCH.feesWithRates$(memo),
        liveData.map(({ fees }) => fees[FEE_OPTION_KEY])
      )

    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.map(({ fees }) => fees[FEE_OPTION_KEY])
      )
  }
}

// state for reloading swap fees
const { get$: reloadSwapFees$, set: reloadSwapFees } = observableState<SwapFeesParams | undefined>(undefined)

const swapFees$: SwapFeesHandler = (params) => {
  return reloadSwapFees$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((reloadParams) => {
      const { source, target } = reloadParams || params
      // source fees
      const sourceSwapFee$ = swapFeeByChain$({
        ...source,
        type: 'source'
      }).pipe(RxOp.shareReplay(1))
      // target fees
      const targetSwapFee$ = Rx.iif(
        // If chains of source and target are the same
        // we don't need to do another request
        // and use same `sourceSwapFee$` stream to get target fees
        () => eqChain.equals(source.asset.chain, target.asset.chain),
        sourceSwapFee$,
        swapFeeByChain$({ ...target, type: 'target' })
      ) // Result needs to be 3 times as "normal" fee
        .pipe(liveData.map((fee) => baseAmount(fee.amount().times(3), fee.decimal)))

      return liveData.sequenceS({
        source: sourceSwapFee$,
        target: targetSwapFee$
      })
    })
  )
}

export { reloadSwapFees, swapFees$ }
