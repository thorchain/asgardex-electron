import * as RD from '@devexperts/remote-data-ts'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { observableState } from '../../../helpers/stateHelper'
import { service as midgardService } from '../../midgard/service'
import * as THOR from '../../thorchain'
import { FeeOptionKeys } from '../const'
import { FeeLD, SwapFeesHandler, SwapFeesParams } from '../types'
import { getInboundFee } from './utils'

const {
  pools: { gasRateByChain$ }
} = midgardService

/**
 * Fees for swap txs into a pool
 */
const inboundFee$ = (asset: Asset): FeeLD => {
  // special case for RUN
  if (!isRuneNativeAsset(asset)) {
    return FP.pipe(
      THOR.fees$(),
      liveData.map((fees) => fees[FeeOptionKeys.SWAP])
    )
  } else {
    FP.pipe(
      gasRateByChain$(asset.chain),
      liveData.map((gasRate) => getInboundFee({ asset, gasRate })),
      RxOp.map((inboundFeeRD) =>
        // Add error in case no address could be found
        FP.pipe(
          inboundFeeRD,
          // TODO @(Veado) Add i18n
          RD.chain((oInboundFee: O.Option<BaseAmount>) =>
            RD.fromOption(oInboundFee, () => Error(`Could not find inbound fee for ${asset.chain}`))
          )
        )
      )
    )
  }

  return Rx.of(RD.failure(Error('inboundFee$ has not been implemented yet')))
}

/**
 * Fees for swap txs outgoing from a pool
 */
const outboundFee$ = (_: Asset): FeeLD => {
  return Rx.of(RD.failure(Error('outboundFee$ has not been implemented yet')))
}

// state for reloading swap fees
const { get$: reloadSwapFees$, set: reloadSwapFees } = observableState<SwapFeesParams | undefined>(undefined)

const swapFees$: SwapFeesHandler = (initialParams) => {
  return reloadSwapFees$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((reloadParams) => {
      // reloadParams is `undefined` by default, that's `initialParams` will be used as default
      const { inAsset, outAsset } = reloadParams || initialParams

      return liveData.sequenceS({
        inAmount: inboundFee$(inAsset),
        outAmount: outboundFee$(outAsset)
      })
    })
  )
}

export { reloadSwapFees, swapFees$ }
