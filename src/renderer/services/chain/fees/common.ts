import { Asset, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { service as midgardService } from '../../midgard/service'
import * as THOR from '../../thorchain'
import { PoolFeeLD } from '../types'
import { getChainFeeByGasRate } from './utils'

const {
  pools: { gasRateByChain$ }
} = midgardService

/**
 * Fees for swap txs
 */
export const poolFee$ = (asset: Asset): PoolFeeLD => {
  // special case for RUNE - not provided by Midgards `inbound_addresses` endpoint
  if (isRuneNativeAsset(asset)) {
    return FP.pipe(
      THOR.fees$(),
      liveData.map((fees) => ({ amount: fees.fast, asset: AssetRuneNative }))
    )
  } else {
    return FP.pipe(
      gasRateByChain$(asset.chain),
      liveData.map((gasRate) => getChainFeeByGasRate({ asset, gasRate })),
      // Map to an error if fee could not be found
      liveData.chain(liveData.fromOption(() => Error(`Could not find fee for ${asset.chain} chain`)))
    )
  }
}
