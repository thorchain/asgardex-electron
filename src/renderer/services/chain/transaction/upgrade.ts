import * as RD from '@devexperts/remote-data-ts'
import { BNBChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import { INITIAL_UPGRADE_RUNE_STATE } from '../../chain/const'
import { service as midgardService } from '../../midgard/service'
import { ErrorId } from '../../wallet/types'
import { UpgradeRuneParams, UpgradeRuneTxState, UpgradeRuneTxState$ } from '../types'
import { sendTx$, txStatusByChain$ } from './common'

const { pools: midgardPoolsService } = midgardService

/**
 * Upgrade BNB.RUNE
 */
export const upgradeBnbRune$ = ({
  poolAddress: oPoolAddress,
  asset,
  amount,
  memo
}: UpgradeRuneParams): UpgradeRuneTxState$ => {
  // Observable state of `UpgradeRuneTxState`
  const { get$: getState$, get: getState, set: setState } = observableState<UpgradeRuneTxState>({
    ...INITIAL_UPGRADE_RUNE_STATE,
    status: RD.pending,
    steps: { current: 1, total: 3 }
  })

  // All requests will be done in a sequence
  // to update `UpgradeRuneTxState` step by step
  const requests$ = FP.pipe(
    oPoolAddress,
    O.fold(
      // invalid pool address will fail
      () => {
        // TODO(@Veado) Add i18n
        setState({ ...getState(), status: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) })
        return Rx.EMPTY
      },
      // valid pool address
      (poolAddress) =>
        Rx.of(poolAddress).pipe(
          // 1. validate pool address
          RxOp.switchMap((poolAddress) => midgardPoolsService.validatePool$(poolAddress, BNBChain)),
          liveData.chain((_) => {
            // Update steps
            setState({ ...getState(), steps: { current: 2, total: 3 } })
            // 2. send upgrade tx
            return sendTx$({
              asset,
              recipient: poolAddress,
              amount,
              memo,
              txType: TxTypes.DEPOSIT,
              feeOptionKey: 'fastest'
            })
          }),
          liveData.chain((txHash) => {
            // Update state
            setState({
              ...getState(),
              steps: { current: 3, total: 3 }
            })
            // 3. check tx finality by polling its tx data
            return txStatusByChain$(txHash, asset.chain)
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
    )
  )

  return Rx.combineLatest([getState$, requests$]).pipe(RxOp.switchMap(() => Rx.of(getState())))
}
