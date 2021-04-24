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
import BigNumber from 'bignumber.js'
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
import { FeeOptionKeys, ZERO_SYM_DEPOSIT_FEES } from '../const'
import { FeeLD, DepositFeesLD, Memo, SymDepositParams, AsymDepositParams, SymDepositFeesHandler } from '../types'

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
                      // Send `BaseAmount` w/o decimal and always round down for currencies
                      value: amount.amount().toFixed(0, BigNumber.ROUND_DOWN)
                    }
                  ]
                : [
                    routerAddress,
                    FP.pipe(getEthTokenAddress(asset), O.toUndefined),
                    // Send `BaseAmount` w/o decimal and always round down for currencies
                    amount.amount().toFixed(0, BigNumber.ROUND_DOWN),
                    memo
                  ]
            })
          }
        ),
        // Actual gas fee changes time to time so in many cases, actual fast gas fee is bigger than estimated fast fee
        // To avoid low gas fee error, we apply fastest fee for ETH only
        liveData.map((fees) => fees['fastest'])
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
const { get$: reloadSymDepositFees$, set: reloadSymDepositFees } = observableState<O.Option<SymDepositParams>>(O.none)

const symDepositFees$: SymDepositFeesHandler = (oInitialParams) => {
  return FP.pipe(
    reloadSymDepositFees$,
    RxOp.debounceTime(300),
    RxOp.switchMap((oReloadParams) => {
      return FP.pipe(
        // (1) Always check reload params first
        oReloadParams,
        // (2) If reload params not set (which is by default), use initial params
        O.alt(() => oInitialParams),
        O.fold(
          // If both (initial + reload params) are not set, return zero fees
          () => Rx.of(RD.success(ZERO_SYM_DEPOSIT_FEES)),
          ({ amounts, poolAddress, asset, memos }) => {
            const { asset: assetAmount, rune: runeAmount } = amounts

            // in case of zero amount, return zero fees (no API request needed)
            if (assetAmount.amount().isZero() || runeAmount.amount().isZero())
              return Rx.of(RD.success(ZERO_SYM_DEPOSIT_FEES))

            return FP.pipe(
              Rx.combineLatest([
                // asset
                depositFee$({
                  asset,
                  amount: assetAmount,
                  poolAddress: O.some(poolAddress),
                  memo: memos.asset
                }),
                // rune
                depositFee$({
                  asset: AssetRuneNative,
                  amount: runeAmount,
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
          }
        )
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
