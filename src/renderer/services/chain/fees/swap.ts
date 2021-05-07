import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqOSwapFeesParams } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import * as THOR from '../../thorchain'
import { SwapFeesHandler, SwapFeesParams, SwapFees } from '../types'
import { poolFee$ } from './common'

const {
  pools: { reloadGasRates }
} = midgardService

/**
 * Returns zero swap fees
 * by given `in` / `out` assets of a swap
 */
export const getZeroSwapFees = ({ inAsset, outAsset }: { inAsset: Asset; outAsset: Asset }): SwapFees => ({
  inFee: { amount: ZERO_BASE_AMOUNT, asset: getChainAsset(inAsset.chain) },
  outFee: { amount: ZERO_BASE_AMOUNT, asset: getChainAsset(outAsset.chain) }
})

// state of `SwapFeesParams` used for reloading swap fees
const { get$: updateSwapFeesParams$, get: updateSwapFeesParamsState, set: updateSwapFeesParams } = observableState<
  O.Option<SwapFeesParams>
>(O.none)

// To trigger reload of swap fees
const reloadSwapFees = (params: SwapFeesParams) => {
  const { inAsset, outAsset } = params

  // if prev. vs. new states are different, update params
  if (!eqOSwapFeesParams.equals(O.some(params), updateSwapFeesParamsState())) {
    updateSwapFeesParams(O.some(params))
  }

  // (1) Check reload of fees for RUNE
  if (isRuneNativeAsset(inAsset) || isRuneNativeAsset(outAsset)) {
    THOR.reloadFees()
  }

  // OR (2) check other fees, which all depend on gas rates
  if (!isRuneNativeAsset(inAsset) || !isRuneNativeAsset(outAsset)) {
    reloadGasRates()
  }
}

const swapFees$: SwapFeesHandler = (initialParams) => {
  return updateSwapFeesParams$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((oReloadParams) => {
      // Since `oReloadParams` is `none` by default,
      // `initialParams` will be used as first value
      const { inAsset, outAsset } = FP.pipe(
        oReloadParams,
        O.getOrElse(() => initialParams)
      )

      return liveData.sequenceS({
        inFee: poolFee$(inAsset),
        outFee: FP.pipe(
          outAsset,
          poolFee$,
          liveData.map((chainFee) => ({
            ...chainFee,
            amount: chainFee.amount.times(3)
          }))
        )
      })
    })
  )
}

export { reloadSwapFees, swapFees$ }
