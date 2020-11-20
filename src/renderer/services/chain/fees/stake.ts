import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../../const'
import { isBaseChain } from '../../../helpers/chainHelper'
import { sequenceTRDFromArray } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { StakeType } from '../../../types/asgardex'
import * as BNB from '../../binance'
import * as BTC from '../../bitcoin'
import { selectedPoolAsset$, selectedPoolChain$ } from '../../midgard/common'
import { symDepositAssetTxMemo$, asymDepositTxMemo$ } from '../memo'
import { FeeLD, LoadFeesHandler, StakeFeesLD } from '../types'
import { reloadStakeFeesByChain } from './fees.helper'

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

// State to reload stake fees
const { get$: reloadStakeFees$, set: reloadStakeFees } = observableState<StakeType>('asym')

/**
 * reload fees
 *
 * Has to be used ONLY on an appropriate view
 * @example
 * useSubscription(updateStakeFeesEffect$)
 */
const updateStakeFeesEffect$ = Rx.combineLatest([selectedPoolChain$, reloadStakeFees$]).pipe(
  RxOp.tap(([oChain, _]) =>
    FP.pipe(
      oChain,
      O.map((chain) => {
        // reload base-chain
        reloadStakeFeesByChain(BASE_CHAIN)
        // For x-chains transfers, load fees for x-chain, too
        if (!isBaseChain(chain)) reloadStakeFeesByChain(chain)
        return true
      })
    )
  )
)

const stakeFeeByChain$ = (chain: Chain, type: StakeType): FeeLD => {
  switch (chain) {
    case 'BNB':
      return BNB.fees$.pipe(liveData.map((fees) => fees.fast))
    case 'BTC':
      // deposit fee for BTC txs based on a memo,
      // which depends on deposit type
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
      return Rx.of(RD.failure(new Error('Stake fee for ETH has not been implemented')))
    case 'THOR':
      return Rx.of(RD.failure(new Error('Stake fee for THOR has not been implemented')))
  }
}

// TODO (@Veado) Store results of deposit fees into a state, so views will have access to it.
// Needed to display success / error states of each transaction
const stakeFees$ = (type: StakeType): StakeFeesLD =>
  selectedPoolAsset$.pipe(
    RxOp.switchMap((oPoolAsset) =>
      FP.pipe(
        oPoolAsset,
        O.map((poolAsset) =>
          FP.pipe(
            Rx.combineLatest(
              type === 'asym'
                ? // for asym deposits, one tx needed only == one fe)
                  [stakeFeeByChain$(BASE_CHAIN, type)]
                : // for sym deposits, two txs needed == 2 fees,
                  [stakeFeeByChain$(BASE_CHAIN, type), stakeFeeByChain$(poolAsset.chain, type)]
            ),
            RxOp.map(sequenceTRDFromArray),
            liveData.map(([base, cross]) => ({
              base,
              cross: O.fromNullable(cross)
            }))
          )
        ),
        O.getOrElse((): StakeFeesLD => Rx.of(RD.initial))
      )
    )
  )

export { stakeFees$, reloadStakeFees, stakeFeeByChain$, updateStakeFeesEffect$ }
