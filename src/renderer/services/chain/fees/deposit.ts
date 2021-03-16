import * as RD from '@devexperts/remote-data-ts'
import { ETHAddress } from '@xchainjs/xchain-ethereum'
import {
  Asset,
  AssetRuneNative,
  BaseAmount,
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthTokenAddress, isEthAsset } from '../../../helpers/assetHelper'
import { sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import * as BCH from '../../bitcoincash'
import { ethRouterABI } from '../../const'
import * as ETH from '../../ethereum'
import * as LTC from '../../litecoin'
import { PoolAddress } from '../../midgard/types'
import * as THOR from '../../thorchain'
import { FeeOptionKeys } from '../const'
import { FeeLD, DepositFeesLD, Memo, SymDepositParams, AsymDepositParams } from '../types'

const depositFee$ = ({
  asset,
  poolAddress: oPoolAddress,
  amount,
  memo
}: {
  readonly poolAddress: O.Option<PoolAddress>
  readonly asset: Asset
  readonly amount: BaseAmount
  readonly memo: Memo
}): FeeLD => {
  switch (asset.chain) {
    case BNBChain:
      return BNB.fees$().pipe(liveData.map(({ fast }) => fast))
    case BTCChain: {
      return BTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees[FeeOptionKeys.DEPOSIT]))
    }

    case THORChain: {
      return THOR.fees$().pipe(liveData.map((fees) => fees[FeeOptionKeys.DEPOSIT]))
    }
    case ETHChain: {
      return FP.pipe(
        oPoolAddress,
        O.chain(({ router }) => router),
        O.fold(
          () => Rx.of(RD.failure(Error('ETH router address is missing'))),
          (router) => {
            const routerAddress = router.toLowerCase()
            return ETH.poolInTxFees$({
              address: router,
              abi: ethRouterABI,
              func: 'deposit',
              params: isEthAsset(asset)
                ? [
                    routerAddress,
                    ETHAddress,
                    0,
                    memo,
                    {
                      value: amount.amount().toFixed()
                    }
                  ]
                : [routerAddress, FP.pipe(getEthTokenAddress(asset), O.toUndefined), amount.amount().toFixed(), memo]
            })
          }
        ),
        liveData.map((fees) => fees[FeeOptionKeys.DEPOSIT])
      )
    }
    case CosmosChain:
      return Rx.of(RD.failure(Error('Deposit fee for Cosmos has not been implemented')))
    case PolkadotChain:
      return Rx.of(RD.failure(Error('Deposit fee for Polkadot has not been implemented')))
    case BCHChain: {
      return BCH.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees[FeeOptionKeys.DEPOSIT]))
    }
    case LTCChain: {
      return LTC.feesWithRates$(memo).pipe(liveData.map(({ fees }) => fees[FeeOptionKeys.DEPOSIT]))
    }
  }
}

// State to reload sym deposit fees
const { get$: reloadSymDepositFees$, set: reloadSymDepositFees } = observableState<SymDepositParams | undefined>(
  undefined
)

const symDepositFees$ = (params: SymDepositParams): DepositFeesLD => {
  return FP.pipe(
    reloadSymDepositFees$,
    RxOp.debounceTime(300),
    RxOp.switchMap((reloadParams) => {
      const { amounts, poolAddress, asset, memos } = reloadParams || params
      return FP.pipe(
        Rx.combineLatest([
          // asset
          depositFee$({
            asset,
            amount: amounts.asset,
            poolAddress: O.some(poolAddress),
            memo: memos.asset
          }),
          // rune
          depositFee$({
            asset: AssetRuneNative,
            amount: amounts.rune,
            memo: memos.rune,
            poolAddress: O.none
          })
        ]),
        RxOp.map(sequenceTRDFromArray),
        liveData.map(([asset, thor]) => ({
          asset,
          thor: O.fromNullable(thor)
        }))
      )
    })
  )
}
// State to reload sym deposit fees
const { get$: reloadAsymDepositFee$, set: reloadAsymDepositFee } = observableState<AsymDepositParams | undefined>(
  undefined
)
const asymDepositFee$ = (_: AsymDepositParams): DepositFeesLD =>
  FP.pipe(
    reloadAsymDepositFee$,
    RxOp.debounceTime(300),
    RxOp.map((_) => RD.failure(Error('not implemented yet')))
  )

export { symDepositFees$, asymDepositFee$, reloadSymDepositFees, reloadAsymDepositFee }
