import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { AssetRuneNative } from '../../../../shared/utils/asset'
import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { liveData } from '../../../helpers/rx/liveData'
import { service as midgardService } from '../../midgard/service'
import * as THOR from '../../thorchain'
import { PoolFeeLD } from '../types'

const {
  pools: { outboundAssetFeeByChain$ }
} = midgardService

/**
 * Fees for pool outbound txs (swap/deposit/withdraw)
 */
export const poolOutboundFee$ = (asset: Asset): PoolFeeLD => {
  // special case for RUNE - not provided in `inbound_addresses` endpoint
  if (isRuneNativeAsset(asset)) {
    return FP.pipe(
      THOR.fees$(),
      liveData.map((fees) => ({ amount: fees.fast.times(3), asset: AssetRuneNative }))
    )
  } else {
    return outboundAssetFeeByChain$(asset.chain)
  }
}
/**
 * Fees for pool inbound txs (swap/deposit/withdraw)
 */
export const poolInboundFee$ = (asset: Asset): PoolFeeLD =>
  FP.pipe(
    poolOutboundFee$(asset),
    // inbound fees = outbound fees / 3
    liveData.map(({ asset, amount }) => ({ asset, amount: amount.div(3) }))
  )
