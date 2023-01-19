import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getEthAssetAddress, isRuneEthAsset } from '../../../helpers/assetHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import { ChainTxFeeOption, INITIAL_UPGRADE_RUNE_STATE } from '../const'
import { UpgradeRuneParams, UpgradeRuneTxState, UpgradeRuneTxState$ } from '../types'
import { poolTxStatusByChain$, sendPoolTx$ } from './common'

const { pools: midgardPoolsService } = midgardService

/**
 * Upgrade BNB.RUNE
 */
export const upgradeRuneToNative$ = ({
  poolAddress: poolAddresses,
  walletAddress,
  walletType,
  walletIndex,
  hdMode,
  asset,
  amount,
  memo,
  network
}: UpgradeRuneParams): UpgradeRuneTxState$ => {
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

  const { chain } = asset

  // All requests will be done in a sequence
  // to update `UpgradeRuneTxState` step by step
  const requests$ = Rx.of(poolAddresses).pipe(
    // 1. validate pool address
    RxOp.switchMap((poolAddresses) => midgardPoolsService.validatePool$(poolAddresses, chain)),
    liveData.chain((_) => {
      // Update steps
      setState({ ...getState(), steps: { current: 2, total: 3 } })
      // 2. send upgrade tx
      return sendPoolTx$({
        sender: walletAddress,
        walletType,
        walletIndex,
        hdMode,
        router: poolAddresses.router,
        asset,
        recipient: poolAddresses.address,
        amount,
        memo,
        feeOption: ChainTxFeeOption.UPGRADE
      })
    }),
    liveData.chain((txHash) => {
      // Update state
      setState({
        ...getState(),
        steps: { current: 3, total: 3 }
      })
      // 3. check tx finality by polling its tx data
      const assetAddress: O.Option<Address> = FP.pipe(
        asset,
        O.fromPredicate((asset) => isRuneEthAsset(asset, network)),
        O.chain(getEthAssetAddress)
      )
      return poolTxStatusByChain$({ txHash, chain, assetAddress })
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
