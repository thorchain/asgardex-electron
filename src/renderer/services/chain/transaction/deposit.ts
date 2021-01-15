import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { TxTypes } from '../../../types/asgardex'
import { service as midgardService } from '../../midgard/service'
import { ApiError, ErrorId } from '../../wallet/types'
import { INITIAL_ASYM_DEPOSIT_STATE, INITIAL_SYM_DEPOSIT_STATE } from '../const'
import {
  AsymDepositParams,
  AsymDepositState,
  AsymDepositState$,
  SymDepositFinalityResult,
  SymDepositParams,
  SymDepositState,
  SymDepositState$,
  SymDepositTxResult,
  SymDepositValidationResult
} from '../types'
import { sendTx$, txStatus$ } from './common'

const { pools: midgardPoolsService, validateNode$ } = midgardService

/**
 * Asym deposit stream does 3 steps:
 *
 * 1. Validate pool address
 * 2. Send deposit transaction
 * 3. Check status of deposit transaction
 *
 * @returns AsymDepositState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModul`
 *
 */
export const asymDeposit$ = ({
  poolAddress: oPoolAddress,
  asset,
  amount,
  memo
}: AsymDepositParams): AsymDepositState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of loading process
  // we start with progress of 25%
  const { get$: getState$, get: getState, set: setState } = observableState<AsymDepositState>({
    ...INITIAL_ASYM_DEPOSIT_STATE,
    txRD: RD.progress({ loaded: 25, total })
  })

  // All requests will be done in a sequence
  // and `AsymDepositState` will be updated step by step
  const requests$ = FP.pipe(
    oPoolAddress,
    // For RuneNative we send `MsgNativeTx` w/o need for a pool address address,
    // so we can leave it empty
    O.alt(() => (isRuneNativeAsset(asset) ? O.some('') : O.none)),
    O.fold(
      // invalid pool address will fail
      () => {
        // TODO(@Veado) Add i18n
        setState({ ...getState(), txRD: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) })
        return Rx.EMPTY
      },
      // valid pool address (even an empty one for Thorchain)
      (poolAddress) =>
        Rx.of(poolAddress).pipe(
          // 1. validate pool address
          RxOp.switchMap((poolAddress) =>
            Rx.iif(
              () => isRuneNativeAsset(asset),
              // We don't have a RUNE pool, so we just validate current connected node
              validateNode$(),
              // in other case we have to validate pool address
              midgardPoolsService.validatePool$(poolAddress, asset.chain)
            )
          ),
          // Update progress
          liveData.chain((_) => {
            setState({ ...getState(), step: 2, txRD: RD.progress({ loaded: 50, total }) })
            // 2. send deposit tx
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
            setState({ ...getState(), step: 3, txRD: RD.progress({ loaded: 75, total }) })
            // 3. check tx finality via midgard (not implemented yet)
            return txStatus$(txHash)
          }),
          // Update state
          liveData.map((txHash) => setState({ ...getState(), txRD: RD.success(O.getOrElse(() => '')(txHash)) })),
          // Add failures to state
          liveData.mapLeft((apiError) => {
            setState({ ...getState(), txRD: RD.failure(apiError) })
            return apiError
          }),
          // handle errors
          RxOp.catchError((error) => {
            setState({ ...getState(), txRD: RD.failure(error) })
            return Rx.EMPTY
          })
        )
    )
  )

  // Just a timer used to update loaded state (in pending state only)
  const timer$ = Rx.timer(1500).pipe(RxOp.filter(() => RD.isPending(getState().txRD)))

  // We do need to fake progress in last step
  // That's we combine streams `getState$` (state updates) and `timer$` (counter)
  // Note: `requests$` has to be added to subscribe it once only (it won't do anything otherwise)
  return Rx.combineLatest([getState$, timer$, requests$]).pipe(
    RxOp.map(([state]) =>
      FP.pipe(
        state.txRD,
        RD.fold(
          // ignore initial state + return same state (no changes)
          () => state,
          // For `pending` we fake progress state in last third
          (oProgress) =>
            FP.pipe(
              oProgress,
              O.map(({ loaded }) => {
                // From 75 to 97 we count progress with small steps, but stop it at 98
                const updatedLoaded = loaded >= 75 && loaded <= 97 ? loaded++ : loaded
                return { ...state, txRD: RD.progress({ loaded: updatedLoaded, total }) }
              }),
              O.getOrElse(() => state)
            ),
          // ignore `failure` state + return same state (no changes)
          () => state,
          // ignore `success` state + return same state (no changes)
          () => state
        )
      )
    ),
    RxOp.startWith({ ...getState() })
  )
}

/**
 * Symetrical deposit stream does 3 steps:
 *
 * 1. Validate pool address
 * 2. Send deposit RUNE transaction
 * 3. Send deposit ASSET transaction
 * 4. Check status of both transactions
 *
 * @returns SwapTxState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModul`
 *
 */
export const symDeposit$ = ({
  poolAddress: oPoolAddress,
  asset,
  amounts,
  memos
}: SymDepositParams): SymDepositState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of loading process
  // we start with  a little progress
  const { get$: getState$, get: getState, set: setState } = observableState<SymDepositState>({
    ...INITIAL_SYM_DEPOSIT_STATE,
    txRD: RD.progress({ loaded: 25, total })
  })

  // All requests will be done in a sequence
  // and `AsymDepositState` will be updated step by step
  const requests$ = FP.pipe(
    oPoolAddress,
    // For RuneNative we send `MsgNativeTx` w/o need for a pool address address,
    // so we can leave it empty
    O.alt(() => (isRuneNativeAsset(asset) ? O.some('') : O.none)),
    O.fold(
      // invalid pool address will fail
      () => {
        // TODO(@Veado) Add i18n
        setState({ ...getState(), txRD: RD.failure({ errorId: ErrorId.SEND_TX, msg: 'invalid pool address' }) })
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
          (v) => v,
          // 2. send deposit txs
          liveData.chain<ApiError, SymDepositValidationResult, SymDepositTxResult>((_) => {
            setState({ ...getState(), step: 2, txRD: RD.progress({ loaded: 50, total }) })

            return liveData.sequenceS({
              // asset deposit tx
              asset: sendTx$({
                asset,
                recipient: '',
                amount: amounts.asset,
                memo: memos.asset,
                txType: TxTypes.DEPOSIT,
                feeOptionKey: 'fastest'
              }),
              // rune deposit tx
              rune: sendTx$({
                asset,
                recipient: '',
                amount: amounts.rune,
                memo: memos.rune,
                txType: TxTypes.DEPOSIT,
                feeOptionKey: 'fastest'
              })
            })
          }),
          (v) => v,
          liveData.chain<ApiError, SymDepositTxResult, SymDepositFinalityResult>((txHashes) => {
            // Update state
            setState({ ...getState(), step: 3, txRD: RD.progress({ loaded: 75, total }), txHashes })
            // 3. check tx finality via midgard (mocked, not implemented yet)
            return liveData.sequenceS({ asset: txStatus$(txHashes.asset), rune: txStatus$(txHashes.rune) })
          }),
          // Update state
          liveData.map((finality) => setState({ ...getState(), txRD: RD.success(finality) })),
          // Add failures to state
          liveData.mapLeft((apiError) => {
            setState({ ...getState(), txRD: RD.failure(apiError) })
            return apiError
          }),
          // handle errors
          RxOp.catchError((error) => {
            setState({ ...getState(), txRD: RD.failure(error) })
            return Rx.EMPTY
          })
        )
    )
  )

  // Just a timer used to update loaded state (in pending state only)
  const timer$ = Rx.timer(1500).pipe(RxOp.filter(() => RD.isPending(getState().txRD)))

  // We do need to fake progress in last step
  // That's we combine streams `getState$` (state updates) and `timer$` (counter)
  // Note: `requests$` has to be added to subscribe it once only (it won't do anything otherwise)
  return Rx.combineLatest([getState$, timer$, requests$]).pipe(
    RxOp.map(([state]) =>
      FP.pipe(
        state.txRD,
        RD.fold(
          // ignore initial state + return same state (no changes)
          () => state,
          // For `pending` we fake progress state in last third
          (oProgress) =>
            FP.pipe(
              oProgress,
              O.map(({ loaded }) => {
                // From 75 to 97 we count progress with small steps, but stop it at 98
                const updatedLoaded = loaded >= 75 && loaded <= 97 ? loaded++ : loaded
                return { ...state, txRD: RD.progress({ loaded: updatedLoaded, total }) }
              }),
              O.getOrElse(() => state)
            ),
          // ignore `failure` state + return same state (no changes)
          () => state,
          // ignore `success` state + return same state (no changes)
          () => state
        )
      )
    ),
    RxOp.startWith({ ...getState() })
  )
}
