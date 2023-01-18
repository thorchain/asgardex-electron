import * as RD from '@devexperts/remote-data-ts'
import { TxHash } from '@xchainjs/xchain-client'
import { Address, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { THORChain } from '../../../../shared/utils/chain'
import { getEthAssetAddress, isEthAsset, isRuneNativeAsset } from '../../../helpers/assetHelper'
import { isEthChain } from '../../../helpers/chainHelper'
import { sequenceSOption } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import { ApiError, ErrorId } from '../../wallet/types'
import { ChainTxFeeOption, INITIAL_ASYM_DEPOSIT_STATE, INITIAL_SYM_DEPOSIT_STATE } from '../const'
import {
  AsymDepositParams,
  AsymDepositState,
  AsymDepositState$,
  SymDepositFinalityResult,
  SymDepositParams,
  SymDepositState,
  SymDepositState$,
  SymDepositValidationResult
} from '../types'
import { sendPoolTx$, poolTxStatusByChain$ } from './common'

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
  poolAddress,
  asset,
  amount,
  memo,
  walletType,
  walletIndex,
  hdMode
}: AsymDepositParams): AsymDepositState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of loading process
  // we start with progress of 25%
  const {
    get$: getState$,
    get: getState,
    set: setState
  } = observableState<AsymDepositState>({
    ...INITIAL_ASYM_DEPOSIT_STATE,
    deposit: RD.progress({ loaded: 25, total })
  })

  // All requests will be done in a sequence
  // and `AsymDepositState` will be updated step by step
  const requests$ = Rx.of(poolAddress).pipe(
    // 1. validate pool address or node
    RxOp.switchMap((poolAddresses) =>
      Rx.iif(
        () => isRuneNativeAsset(asset),
        // We don't have a RUNE pool, so we just validate current connected node
        validateNode$(),
        // in other case we have to validate pool address
        midgardPoolsService.validatePool$(poolAddresses, asset.chain)
      )
    ),
    liveData.chain((_) => {
      // Update progress
      setState({ ...getState(), step: 2, deposit: RD.progress({ loaded: 50, total }) })
      // 2. send deposit tx
      return sendPoolTx$({
        walletType,
        walletIndex,
        hdMode,
        router: poolAddress.router,
        asset,
        recipient: poolAddress.address,
        amount,
        memo,
        feeOption: ChainTxFeeOption.DEPOSIT
      })
    }),
    liveData.chain((txHash) => {
      // Update state
      setState({
        ...getState(),
        step: 3,
        depositTx: RD.success(txHash),
        deposit: RD.progress({ loaded: 75, total })
      })
      // 3. check tx finality by polling its tx data
      const assetAddress: O.Option<Address> =
        isEthChain(asset.chain) && !isEthAsset(asset) ? getEthAssetAddress(asset) : O.none
      return poolTxStatusByChain$({ txHash, chain: asset.chain, assetAddress })
    }),
    // Update state
    liveData.map((_) => setState({ ...getState(), deposit: RD.success(true) })),

    // Add failures to state
    liveData.mapLeft((apiError) => {
      setState({ ...getState(), deposit: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), deposit: RD.failure(error) })
      return Rx.EMPTY
    })
  )
  // We do need to fake progress in last step
  // Note: `requests$` has to be added to subscribe it once (it won't do anything otherwise)
  return Rx.combineLatest([getState$, requests$]).pipe(
    RxOp.switchMap(([state, _]) =>
      FP.pipe(
        // check deposit state to update its `pending` state (if needed)
        state.deposit,
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
                  O.map(({ loaded }): AsymDepositState => {
                    // From 75 to 97 we count progress with small steps, but stop it at 98
                    const updatedLoaded = loaded >= 75 && loaded <= 97 ? loaded++ : loaded
                    return { ...state, deposit: RD.progress({ loaded: updatedLoaded, total }) }
                  }),
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

/**
 * Symetrical deposit stream does 4 steps:
 *
 * 1. Validate pool address + node
 * 2. Send deposit ASSET transaction
 * 3. Send deposit RUNE transaction
 * 4. Check status of both transactions
 *
 * @returns SymDepositState$ - Observable state to reflect loading status. It provides all data we do need to display status in `TxModul`
 *
 */
export const symDeposit$ = ({
  poolAddress: poolAddresses,
  asset,
  amounts,
  memos,
  runeWalletType,
  runeWalletIndex,
  runeHDMode,
  runeSender,
  assetWalletType,
  assetWalletIndex,
  assetHDMode,
  assetSender
}: SymDepositParams): SymDepositState$ => {
  // total of progress
  const total = O.some(100)

  // Observable state of to reflect status of all needed steps
  const {
    get$: getState$,
    get: getState,
    set: setState
  } = observableState<SymDepositState>({
    ...INITIAL_SYM_DEPOSIT_STATE,
    depositTxs: { rune: RD.pending, asset: RD.pending },
    // we start with  a small progress
    deposit: RD.progress({ loaded: 20, total })
  })

  // All requests will be done in a sequence
  // to update `SymDepositState` step by step
  const requests$ = Rx.of(poolAddresses).pipe(
    // 1. Validation pool address + node
    RxOp.switchMap((poolAddresses) =>
      liveData.sequenceS({
        pool: midgardPoolsService.validatePool$(poolAddresses, asset.chain),
        node: validateNode$()
      })
    ),
    // 2. send asset deposit txs
    liveData.chain<ApiError, SymDepositValidationResult, TxHash>((_) => {
      setState({ ...getState(), step: 2, deposit: RD.progress({ loaded: 40, total }) })
      return sendPoolTx$({
        sender: assetSender,
        walletType: assetWalletType,
        walletIndex: assetWalletIndex,
        hdMode: assetHDMode,
        router: poolAddresses.router,
        asset,
        recipient: poolAddresses.address,
        amount: amounts.asset,
        memo: memos.asset,
        feeOption: ChainTxFeeOption.DEPOSIT
      })
    }),
    // Add failures of asset deposit tx to state
    liveData.mapLeft<ApiError, ApiError, TxHash>((apiError) => {
      const current = getState()
      setState({ ...current, depositTxs: { ...current.depositTxs, asset: RD.failure(apiError) } })
      return apiError
    }),
    // Add success of asset deposit tx to state
    liveData.map<TxHash, TxHash>((txHash) => {
      const current = getState()
      setState({ ...current, depositTxs: { ...current.depositTxs, asset: RD.success(txHash) } })
      return txHash
    }),
    // 3. send RUNE deposit txs
    liveData.chain<ApiError, TxHash, TxHash>((_) => {
      setState({ ...getState(), step: 3, deposit: RD.progress({ loaded: 60, total }) })
      return sendPoolTx$({
        sender: runeSender,
        walletType: runeWalletType,
        walletIndex: runeWalletIndex,
        hdMode: runeHDMode,
        router: O.none, // no router for RUNE
        asset: AssetRuneNative,
        recipient: '', // no recipient for RUNE needed
        amount: amounts.rune,
        memo: memos.rune,
        feeOption: ChainTxFeeOption.DEPOSIT
      })
    }),
    // Add failures of RUNE deposit tx to state
    liveData.mapLeft<ApiError, ApiError, TxHash>((apiError) => {
      const current = getState()
      setState({ ...current, depositTxs: { ...current.depositTxs, rune: RD.failure(apiError) } })
      return apiError
    }),
    // Add success of RUNE deposit tx to state
    liveData.map<TxHash, TxHash>((txHash) => {
      const current = getState()
      setState({ ...current, depositTxs: { ...current.depositTxs, rune: RD.success(txHash) } })
      return txHash
    }),
    // check finality of both deposit txs
    liveData.chain<ApiError, TxHash, SymDepositFinalityResult>((_) => {
      const currentState = getState()
      // Update state
      setState({ ...currentState, step: 4, deposit: RD.progress({ loaded: 80, total }) })

      const { rune: runeTxRD, asset: assetTxRD } = currentState.depositTxs
      return FP.pipe(
        sequenceSOption({ runeTxHash: RD.toOption(runeTxRD), assetTxHash: RD.toOption(assetTxRD) }),
        O.fold(
          () =>
            Rx.of<RD.RemoteData<ApiError, never>>(
              RD.failure({ errorId: ErrorId.SEND_TX, msg: 'Something went wrong to send deposit txs' })
            ),
          // 4. check tx finality
          ({ runeTxHash, assetTxHash }) => {
            const assetAddress: O.Option<Address> =
              isEthChain(asset.chain) && !isEthAsset(asset) ? getEthAssetAddress(asset) : O.none

            return liveData.sequenceS({
              asset: poolTxStatusByChain$({ txHash: assetTxHash, chain: asset.chain, assetAddress }),
              rune: poolTxStatusByChain$({ txHash: runeTxHash, chain: THORChain, assetAddress: O.none })
            })
          }
        )
      )
    }),
    liveData.map<SymDepositFinalityResult, SymDepositFinalityResult>((finality) => {
      // Update state
      setState({ ...getState(), deposit: RD.success(true) })
      return finality
    }),
    // Add failures to state
    liveData.mapLeft<ApiError, ApiError, SymDepositFinalityResult>((apiError) => {
      setState({ ...getState(), deposit: RD.failure(apiError) })
      return apiError
    }),
    // handle errors
    RxOp.catchError((error) => {
      setState({ ...getState(), deposit: RD.failure(error) })
      return Rx.EMPTY
    })
  )
  // We do need to fake progress in last step
  // Note: `requests$` has to be added to subscribe it once (it won't do anything otherwise)
  return Rx.combineLatest([getState$, requests$]).pipe(
    RxOp.switchMap(([state, _]) =>
      FP.pipe(
        // check deposit state to update its `pending` state (if needed)
        state.deposit,
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
                  O.map(({ loaded }): SymDepositState => {
                    // From 80 to 97 we count progress with small steps, but stop it at 98
                    const updatedLoaded = loaded >= 80 && loaded <= 97 ? loaded++ : loaded
                    return { ...state, deposit: RD.progress({ loaded: updatedLoaded, total }) }
                  }),
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
