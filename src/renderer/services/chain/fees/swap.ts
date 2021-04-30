import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { eqOSwapFeesParams } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import * as THOR from '../../thorchain'
import { FeeOptionKeys } from '../const'
import { SwapFee, SwapFeesHandler, SwapFeeLD, SwapFeesParams } from '../types'
import { getInboundFee, getOutboundFee, getZeroSwapFees } from './utils'

const {
  pools: { gasRateByChain$, reloadGasRates }
} = midgardService

/**
 * Fees for swap txs into a pool
 */
const inboundFee$ = (asset: Asset): SwapFeeLD => {
  // special case for RUNE
  if (isRuneNativeAsset(asset)) {
    return FP.pipe(
      THOR.fees$(),
      liveData.map((fees) => ({ amount: fees[FeeOptionKeys.SWAP], asset: AssetRuneNative }))
    )
  } else {
    return FP.pipe(
      gasRateByChain$(asset.chain),
      liveData.map((gasRate) => getInboundFee({ asset, gasRate })),
      RxOp.map((inboundFeeRD) =>
        FP.pipe(
          inboundFeeRD,
          // TODO @(Veado) Add i18n
          RD.chain((oInboundFee: O.Option<SwapFee>) =>
            // Map to an error if inbound fee could not be found
            RD.fromOption(oInboundFee, () => Error(`Could not find inbound fee for ${asset.chain}`))
          )
        )
      )
    )
  }
}

/**
 * Fees for swap txs outgoing from a pool
 */
const outboundFee$ = (asset: Asset): SwapFeeLD => {
  // special case for RUNE
  if (isRuneNativeAsset(asset)) {
    return FP.pipe(
      THOR.fees$(),
      liveData.map((fees) => ({ amount: fees[FeeOptionKeys.SWAP], asset: AssetRuneNative }))
    )
  } else {
    return FP.pipe(
      gasRateByChain$(asset.chain),
      liveData.map((gasRate) => getOutboundFee({ asset, gasRate })),
      RxOp.map((inboundFeeRD) =>
        // Add error in case no address could be found
        FP.pipe(
          inboundFeeRD,
          // TODO @(Veado) Add i18n
          RD.chain((oInboundFee: O.Option<SwapFee>) =>
            RD.fromOption(oInboundFee, () => Error(`Could not find inbound fee for ${asset.chain}`))
          )
        )
      )
    )
  }
}

// state of `SwapFeesParams` used for reloading swap fees
const { get$: updateSwapFeesParams$, get: updateSwapFeesParamsState, set: updateSwapFeesParams } = observableState<
  O.Option<SwapFeesParams>
>(O.none)

// To trigger reloading of swap fees accept `none` option values of `SwapFeesParams` only
const reloadSwapFees = (params: SwapFeesParams) => {
  const { inAsset, outAsset, inAmount } = params

  // if prev. vs. new states are different, update params
  if (!eqOSwapFeesParams.equals(O.some(params), updateSwapFeesParamsState())) {
    updateSwapFeesParams(O.some(params))
  }

  if (inAmount.amount().isZero()) return {}

  // (1) Trigger reload of fees for RUNE
  if (isRuneNativeAsset(inAsset) || isRuneNativeAsset(outAsset)) {
    console.log('RUNE reload fees:')
    THOR.reloadFees()
  }

  // OR (2) for other fees, which all depend on gas rates
  if (!isRuneNativeAsset(inAsset) || !isRuneNativeAsset(outAsset)) {
    console.log('reload gas rates:')
    reloadGasRates()
  }
}

const swapFees$: SwapFeesHandler = (initialParams) => {
  return updateSwapFeesParams$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((oReloadParams) => {
      // Since `oReloadParams` is `none` by default,
      // `initialParams` will be used as first value
      const { inAsset, outAsset, inAmount } = FP.pipe(
        oReloadParams,
        O.getOrElse(() => initialParams)
      )

      console.log('amount', inAmount.amount().toString())
      // in case of zero amount, return zero fees (no API request needed)
      if (inAmount.amount().isZero()) {
        const zeroSwapFees = getZeroSwapFees({ inAsset, outAsset })
        return Rx.of(RD.success(zeroSwapFees))
      }

      return liveData.sequenceS({
        inFee: inboundFee$(inAsset),
        outFee: outboundFee$(outAsset)
      })
    })
  )
}

export { reloadSwapFees, swapFees$ }
