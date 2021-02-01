import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetRuneNative, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { sequenceSOption } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import { service as midgardService } from '../../midgard/service'
import { ApiError, ErrorId } from '../../wallet/types'
import { INITIAL_SYM_DEPOSIT_STATE } from '../const'
import {
  SymWithdrawValidationResult,
  SymWithdrawParams,
  SymWithdrawState,
  SymWithdrawState$,
  SymWithdrawFinalityResult
} from '../types'
import { txStatusByChain$, sendTx$ } from './common'

const { pools: midgardPoolsService, validateNode$ } = midgardService

/**
 * Symetrical withdraw stream does 4 steps:
 *
 * 1. Validate pool address + node
 * 2. Send withdraw RUNE transaction
 * 3. Send withdraw ASSET transaction
 * 4. Check status of both transactions
 *
 * @returns SymWithdrawState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModul`
 *
 */
export const symWithdraw$ = ({
  poolAddress: oPoolAddress,
  asset,
  amounts,
  memos
}: SymWithdrawParams): SymWithdrawState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of to reflect status of all needed steps
  const { get$: getState$, get: getState, set: setState } = observableState<SymWithdrawState>({
    ...INITIAL_SYM_DEPOSIT_STATE,
    withdrawTxs: { rune: RD.pending, asset: RD.pending },
    // we start with  a small progress
    withdraw: RD.progress({ loaded: 20, total })
  })

  // All requests will be done in a sequence
  // to update `SymWithdrawState` step by step
  const requests$ = FP.pipe(
    oPoolAddress,
    // For RuneNative we send `MsgNativeTx` w/o need for a pool address address,
    // so we can leave it empty
    O.alt(() => (isRuneNativeAsset(asset) ? O.some('') : O.none)),
    O.fold(
      // invalid pool address will fail
      () => {
        // TODO(@Veado) Add i18n
        setState({ ...getState(), withdraw: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) })
        return Rx.EMPTY
      },
      // continue with a pool address (even an empty one for Thorchain)
      (poolAddress) =>
        Rx.of(poolAddress).pipe(
          // 1. Validation pool address + node
          RxOp.switchMap((poolAddress) =>
            liveData.sequenceS({
              pool: midgardPoolsService.validatePool$(poolAddress, asset.chain),
              node: validateNode$()
            })
          ),
          // 2. send RUNE witdraw txs
          liveData.chain<ApiError, SymWithdrawValidationResult, TxHash>((_) => {
            setState({ ...getState(), step: 2, withdraw: RD.progress({ loaded: 40, total }) })
            return sendTx$({
              asset: AssetRuneNative,
              recipient: '',
              amount: amounts.rune,
              memo: memos.rune,
              txType: TxTypes.WITHDRAW,
              feeOptionKey: 'fastest'
            })
          }),
          // Add failures of RUNE withdraw tx to state
          liveData.mapLeft<ApiError, ApiError, TxHash>((apiError) => {
            const current = getState()
            setState({ ...current, withdrawTxs: { ...current.withdrawTxs, rune: RD.failure(apiError) } })
            return apiError
          }),
          // Add success of RUNE withdraw tx to state
          liveData.map<TxHash, TxHash>((txHash) => {
            const current = getState()
            setState({ ...current, withdrawTxs: { ...current.withdrawTxs, rune: RD.success(txHash) } })
            return txHash
          }),
          // 3. send asset withdraw txs
          liveData.chain<ApiError, TxHash, TxHash>((_) => {
            setState({ ...getState(), step: 3, withdraw: RD.progress({ loaded: 60, total }) })
            return sendTx$({
              asset,
              recipient: poolAddress,
              amount: amounts.asset,
              memo: memos.asset,
              txType: TxTypes.DEPOSIT,
              feeOptionKey: 'fastest'
            })
          }),
          // Add failures of asset withdraw tx to state
          liveData.mapLeft<ApiError, ApiError, TxHash>((apiError) => {
            const current = getState()
            setState({ ...current, withdrawTxs: { ...current.withdrawTxs, asset: RD.failure(apiError) } })
            return apiError
          }),
          // Add success of asset withdraw tx to state
          liveData.map<TxHash, TxHash>((txHash) => {
            const current = getState()
            setState({ ...current, withdrawTxs: { ...current.withdrawTxs, asset: RD.success(txHash) } })
            return txHash
          }),
          // check finality of both withdraw txs
          liveData.chain<ApiError, TxHash, SymWithdrawFinalityResult>((_) => {
            const currentState = getState()
            // Update state
            setState({ ...currentState, step: 4, withdraw: RD.progress({ loaded: 80, total }) })

            const { rune: runeTxRD, asset: assetTxRD } = currentState.withdrawTxs
            return FP.pipe(
              sequenceSOption({ runeTxHash: RD.toOption(runeTxRD), assetTxHash: RD.toOption(assetTxRD) }),
              O.fold(
                () => Rx.of(RD.failure({ errorId: ErrorId.SEND_TX, msg: 'Something went wrong to send withdraw txs' })),
                // 4. check tx finality
                ({ runeTxHash, assetTxHash }) =>
                  liveData.sequenceS({
                    asset: txStatusByChain$(assetTxHash, asset.chain),
                    rune: txStatusByChain$(runeTxHash, THORChain)
                  })
              )
            )
          }),
          liveData.map<SymWithdrawFinalityResult, SymWithdrawFinalityResult>((finality) => {
            // Update state
            setState({ ...getState(), withdraw: RD.success(true) })
            return finality
          }),
          // Add failures to state
          liveData.mapLeft<ApiError, ApiError, SymWithdrawValidationResult>((apiError) => {
            setState({ ...getState(), withdraw: RD.failure(apiError) })
            return apiError
          }),
          // handle errors
          RxOp.catchError((error) => {
            setState({ ...getState(), withdraw: RD.failure(error) })
            return Rx.EMPTY
          })
        )
    )
  )

  // We do need to fake progress in last step
  // Note: `requests$` has to be added to subscribe it once (it won't do anything otherwise)
  return Rx.combineLatest([getState$, requests$]).pipe(
    RxOp.switchMap(([state, _]) =>
      FP.pipe(
        // check withdraw state to update its `pending` state (if needed)
        state.withdraw,
        RD.fold(
          // ignore initial state + return same state (no changes)
          () => Rx.of(state),
          // For `pending` state we fake progress state in last third
          (oProgress) =>
            FP.pipe(
              // Just a timer used to update loaded state (in pending state only)
              Rx.interval(1500),
              RxOp.map(() =>
                FP.pipe(
                  oProgress,
                  O.map(
                    ({ loaded }): SymWithdrawState => {
                      // From 80 to 97 we count progress with small steps, but stop it at 98
                      const updatedLoaded = loaded >= 80 && loaded <= 97 ? loaded++ : loaded
                      return { ...state, withdraw: RD.progress({ loaded: updatedLoaded, total }) }
                    }
                  ),
                  O.getOrElse(() => state)
                )
              )
            ),
          // ignore `failure` state + return same state (no changes)
          () => Rx.of(state),
          // ignore `success` state + return same state (no changes)
          () => Rx.of(state)
        )
      )
    ),
    RxOp.startWith({ ...getState() })
  )
}
