import { getValueOfAsset1InAsset2, getValueOfRuneInAsset, PoolData } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolShareTableData } from '../../components/PoolShares/PoolShares.types'
import * as shareHelpers from '../../helpers/poolShareHelper'
import { PoolDetails, PoolShares } from '../../services/midgard/types'
import { getPoolDetail, toPoolData } from '../../services/midgard/utils'

export const getPoolShareTableData = (
  shares: PoolShares,
  poolDetails: PoolDetails,
  pricePoolData: PoolData
): PoolShareTableData =>
  FP.pipe(
    shares,
    A.filterMap(({ units, asset }) =>
      FP.pipe(
        getPoolDetail(poolDetails, asset),
        O.map((poolDetail) => {
          const runeShare = shareHelpers.getRuneShare(units, poolDetail)
          const assetShare = shareHelpers.getAssetShare(units, poolDetail)
          const sharePercent = shareHelpers.getPoolShare(units, poolDetail)
          const poolData = toPoolData(poolDetail)
          const assetDepositPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
          const runeDepositPrice = getValueOfRuneInAsset(runeShare, pricePoolData)

          return {
            asset,
            runeShare,
            assetShare,
            sharePercent,
            assetDepositPrice,
            runeDepositPrice
          }
        })
      )
    )
  )
