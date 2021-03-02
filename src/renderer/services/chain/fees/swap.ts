import * as RD from '@devexperts/remote-data-ts'
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
import { FeesRD } from '../../clients'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import * as THOR from '../../thorchain'
import { FeesLD, Memo, SwapFeeHandler, SwapFeeParams } from '../types'

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
      return Rx.of(RD.failure(Error('Bitcoincash fees is not implemented yet')))

    case LTCChain:
      return FP.pipe(
        LTC.feesWithRates$(memo),
        liveData.map(({ fees }) => fees)
      )
  }
}

// state for reloading swap fees
const { get$: reloadSwapFees$, set: reloadSwapFees } = observableState<SwapFeeParams | undefined>(undefined)

const swapFee$: SwapFeeHandler = (params) => {
  return reloadSwapFees$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((reloadParams) => {
      const { asset, amount, memo, recipient: oRecipient } = reloadParams || params
      const feesLD: LiveData<Error, Fees> = feesByChain$({
        asset,
        amount,
        memo,
        recipient: FP.pipe(oRecipient, O.toUndefined)
      })

      return FP.pipe(
        feesLD,
        liveData.map((fees) => fees.fastest),
        liveData.map((fee) => baseAmount(fee.amount(), fee.decimal))
      )
    })
  )
}

export { reloadSwapFees, swapFee$ }
