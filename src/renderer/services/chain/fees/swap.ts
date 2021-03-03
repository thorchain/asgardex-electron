import * as RD from '@devexperts/remote-data-ts'
import { getSwapMemo } from '@thorchain/asgardex-util'
import { Address, Fees } from '@xchainjs/xchain-client'
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
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getChainAsset } from '../../../helpers/chainHelper'
import { sequenceSOption } from '../../../helpers/fpHelpers'
import { LiveData, liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import { FeesRD } from '../../clients'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeesLD, Memo, SwapFeeParams, SwapFeesHandler, SwapFeesParams } from '../types'

const feesByChain$ = ({
  asset,
  memo,
  amount,
  recipient
}: {
  asset: Asset
  memo?: Memo
  amount?: BaseAmount
  recipient?: Address
}): FeesLD => {
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
        sequenceSOption({ amount: O.fromNullable(amount), recipient: O.fromNullable(recipient) }),
        O.map(({ amount, recipient }) =>
          FP.pipe(
            ETH.fees$({
              asset,
              amount,
              recipient,
              memo
            }),
            liveData.map((fees) => fees)
          )
        ),
        O.getOrElse(() => Rx.of<FeesRD>(RD.failure(Error('Missing amount or recipient'))))
      )

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

const swapFee$ = ({
  asset,
  amount,
  memo,
  type,
  recipient: oRecipient
}: SwapFeeParams & {
  type: SwapFeeType
}) => {
  const feesLD: LiveData<Error, Fees> = feesByChain$({
    asset,
    amount,
    memo,
    recipient: FP.pipe(oRecipient, O.toUndefined)
  })

  const multiplier = type === 'source' ? 1 : 3

  return FP.pipe(
    feesLD,
    liveData.map((fees) => fees.fastest),
    liveData.map((fee) => baseAmount(fee.amount().times(multiplier), fee.decimal))
  )
}

// state for reloading swap fees
const { get$: reloadSwapFees$, set: reloadSwapFees } = observableState<SwapFeesParams | undefined>(undefined)

const swapFees$: SwapFeesHandler = (params) => {
  return reloadSwapFees$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((reloadParams) => {
      const { source, target } = reloadParams || params
      return liveData.sequenceS({
        source: swapFee$({ ...source, type: 'source', memo: getSwapMemo({ asset: params.source.asset }) }),
        target: swapFee$({ ...target, type: 'target' })
      })
    })
  )
}

export { reloadSwapFees, swapFees$ }
