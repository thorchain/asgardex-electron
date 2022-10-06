import { getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import { Asset, baseAmount, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'

import { convertBaseAmountDecimal, isRuneNativeAsset, to1e8BaseAmount } from '../../../helpers/assetHelper'
import { eqAsset } from '../../../helpers/fp/eq'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { RUNE_POOL_DATA } from '../../../helpers/poolHelper'
import { PoolsDataMap } from '../../midgard/types'

export const getPoolData = (poolsData: PoolsDataMap, asset: Asset): O.Option<PoolData> =>
  FP.pipe(
    poolsData[assetToString(asset)],
    O.fromNullable,
    O.alt(() => (isRuneNativeAsset(asset) ? O.some(RUNE_POOL_DATA) : O.none))
  )

export const priceFeeAmountForAsset = ({
  feeAmount,
  feeAsset,
  asset,
  assetDecimal,
  poolsData
}: {
  feeAmount: BaseAmount
  feeAsset: Asset
  asset: Asset
  assetDecimal: number
  poolsData: PoolsDataMap
}): BaseAmount => {
  // no pricing needed if both assets are the same
  if (eqAsset.equals(feeAsset, asset)) return feeAmount

  const oFeeAssetPoolData: O.Option<PoolData> = getPoolData(poolsData, feeAsset)
  const oAssetPoolData: O.Option<PoolData> = getPoolData(poolsData, asset)

  return FP.pipe(
    sequenceTOption(oFeeAssetPoolData, oAssetPoolData),
    O.map(([feeAssetPoolData, assetPoolData]) =>
      // pool data are always 1e8 decimal based
      // and we have to convert fees to 1e8, too
      getValueOfAsset1InAsset2(to1e8BaseAmount(feeAmount), feeAssetPoolData, assetPoolData)
    ),
    // convert decimal back to sourceAssetDecimal
    O.map((amount) => convertBaseAmountDecimal(amount, assetDecimal)),
    O.getOrElse(() => baseAmount(0, assetDecimal))
  )
}
