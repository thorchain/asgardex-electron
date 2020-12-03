import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { DepositType } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import { selectedPoolAsset$, selectedPoolChain$ } from '../../midgard/common'
import * as THOR from '../../thorchain'
import { symDepositAssetTxMemo$, asymDepositTxMemo$ } from '../memo'
import { FeeLD, LoadFeesHandler, DepositFeesLD } from '../types'
import { reloadDepositFeesByChain } from './fees.helper'

export const reloadFees = () => {
  BNB.reloadFees()
  BTC.reloadFees()
}

const reloadFeesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.reloadFees
    case 'BTC':
      return BTC.reloadFees
    case 'ETH':
      // reload ETH balances - not available yet
      return () => {}
    case 'THOR':
      // reload THOR fees - not available yet
      return () => {}
    default:
      return () => {}
  }
}

export const reloadFees$: Rx.Observable<O.Option<LoadFeesHandler>> = selectedPoolChain$.pipe(
  RxOp.map(O.map(reloadFeesByChain))
)

// State to reload deposit fees
const { get$: reloadDepositFees$, set: reloadDepositFees } = observableState<DepositType>('asym')

/**
 * Reload fees
 *
 * Has to be used ONLY on an appropriate view
 * @example
 * useSubscription(reloadDepositFeesEffect$)
 */
// Rx.Observable<boolean>
const reloadDepositFeesEffect$: Rx.Observable<boolean> = Rx.combineLatest([
  selectedPoolChain$,
  reloadDepositFees$
]).pipe(
  RxOp.map(([oChain, type]) =>
    FP.pipe(
      oChain,
      O.map((chain) => {
        // asset chain fees
        reloadDepositFeesByChain(chain)
        // thorchain fees are needed for sym deposits only
        if (type === 'sym') {
          reloadDepositFeesByChain('THOR')
        }

        return true
      }),
      O.getOrElse<boolean>(() => false)
    )
  )
)

const depositFeeByChain$ = (chain: Chain, type: DepositType): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.fees$.pipe(liveData.map(({ fast }) => fast))
    case 'BTC':
      // deposit fee for BTC txs based on a memo,
      // and memo depends on deposit type
      return Rx.iif(() => type === 'asym', asymDepositTxMemo$, symDepositAssetTxMemo$).pipe(
        RxOp.switchMap((oMemo) =>
          FP.pipe(
            oMemo,
            O.fold(
              () => Rx.of(RD.initial),
              (memo) => BTC.poolFee$(memo)
            )
          )
        )
      )
    case 'ETH':
      return Rx.of(RD.failure(new Error('Deposit fee for ETH has not been implemented')))
    case 'THOR':
      return THOR.fees$.pipe(liveData.map(({ fast }) => fast))
  }
}

const depositFees$ = (type: DepositType): DepositFeesLD =>
  selectedPoolAsset$.pipe(
    RxOp.switchMap((oPoolAsset) =>
      FP.pipe(
        oPoolAsset,
        O.map((poolAsset) =>
          FP.pipe(
            Rx.combineLatest(
              type === 'asym'
                ? // for asym deposits, one tx needed at asset chain only == one fee)
                  [depositFeeByChain$(poolAsset.chain, type)]
                : // for sym deposits, two txs at thorchain an asset chain needed == 2 fees,
                  [depositFeeByChain$(poolAsset.chain, type), depositFeeByChain$('THOR', type)]
            ),
            RxOp.map(sequenceTRDFromArray),
            liveData.map(([asset, thor]) => ({
              asset,
              thor: O.fromNullable(thor)
            }))
          )
        ),
        O.getOrElse((): DepositFeesLD => Rx.of(RD.initial))
      )
    )
  )

export { depositFees$, reloadDepositFees, depositFeeByChain$, reloadDepositFeesEffect$ }
