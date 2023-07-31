import { THORChain } from '@xchainjs/xchain-thorchain'
import { Asset, isSynthAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqOSwapFeesParams } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import * as THOR from '../../thorchain'
import { reloadInboundAddresses } from '../../thorchain'
import { SwapFeesHandler, SwapFeesParams, SwapFees } from '../types'
import { poolOutboundFee$, poolInboundFee$ } from './common'

/**
 * Returns zero swap fees
 * by given `in` / `out` assets of a swap
 */
export const getZeroSwapFees = ({ inAsset, outAsset }: { inAsset: Asset; outAsset: Asset }): SwapFees => ({
  inFee: { amount: ZERO_BASE_AMOUNT, asset: getChainAsset(inAsset.synth ? THORChain : inAsset.chain) },
  outFee: { amount: ZERO_BASE_AMOUNT, asset: getChainAsset(outAsset.synth ? THORChain : outAsset.chain) }
})

// state of `SwapFeesParams` used for reloading swap fees
const {
  get$: updateSwapFeesParams$,
  get: updateSwapFeesParamsState,
  set: updateSwapFeesParams
} = observableState<O.Option<SwapFeesParams>>(O.none)

// To trigger reload of swap fees
const reloadSwapFees = (params: SwapFeesParams) => {
  const { inAsset, outAsset } = params
  // if prev. vs. new states are different, update params
  if (!eqOSwapFeesParams.equals(O.some(params), updateSwapFeesParamsState())) {
    updateSwapFeesParams(O.some(params))
  }

  // (1) Check reload of fees for RUNE
  if (isRuneNativeAsset(inAsset) || isRuneNativeAsset(outAsset) || isSynthAsset(inAsset) || isSynthAsset(outAsset)) {
    THOR.reloadFees()
  }

  // OR (2) check other fees, which all depend on outbound fees defined in `inbound_addresses`
  if (!isRuneNativeAsset(inAsset) || !isRuneNativeAsset(outAsset)) {
    reloadInboundAddresses()
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
        inFee: poolInboundFee$(inAsset),
        outFee: poolOutboundFee$(outAsset)
      })
    })
  )
}

export { reloadSwapFees, swapFees$ }
