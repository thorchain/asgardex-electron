import * as RD from '@devexperts/remote-data-ts'
import { BNBChain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { INITIAL_UPGRADE_RUNE_STATE } from '../../chain/const'
import { service as midgardService } from '../../midgard/service'
import { UpgradeRuneParams, UpgradeRuneTxState, UpgradeRuneTxState$ } from '../types'
import { poolTxStatusByChain$, sendPoolTx$ } from './common'

const { pools: midgardPoolsService } = midgardService

/**
 * Upgrade BNB.RUNE
 */
export const upgradeBnbRune$ = ({ poolAddresses, asset, amount, memo }: UpgradeRuneParams): UpgradeRuneTxState$ => {
  // Observable state of `UpgradeRuneTxState`
  const {
    get$: getState$,
    get: getState,
    set: setState
  } = observableState<UpgradeRuneTxState>({
    ...INITIAL_UPGRADE_RUNE_STATE,
    status: RD.pending,
    steps: { current: 1, total: 3 }
  })

  // All requests will be done in a sequence
  // to update `UpgradeRuneTxState` step by step
  const requests$ = Rx.of(poolAddresses).pipe(
    // 1. validate pool address
    RxOp.switchMap((poolAddresses) => midgardPoolsService.validatePool$(poolAddresses, BNBChain)),
    liveData.chain((_) => {
      // Update steps
      setState({ ...getState(), steps: { current: 2, total: 3 } })
      // 2. send upgrade tx
      return sendPoolTx$({
        router: O.none,
        asset,
        recipient: poolAddresses.address,
        amount,
        memo,
        feeOptionKey: 'fast'
      })
    }),
    liveData.chain((txHash) => {
      // Update state
      setState({
        ...getState(),
        steps: { current: 3, total: 3 }
      })
      // 3. check tx finality by polling its tx data
      return poolTxStatusByChain$({ txHash, chain: asset.chain, assetAddress: O.none })
    }),
    // Update state
    liveData.map(({ hash }) => setState({ ...getState(), status: RD.success(hash) })),
    // Add failures to state
    liveData.mapLeft((apiError) => {
      setState({ ...getState(), status: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), status: RD.failure(error) })
      return Rx.EMPTY
    })
  )

  return Rx.combineLatest([getState$, requests$]).pipe(RxOp.switchMap(() => Rx.of(getState())))
}
