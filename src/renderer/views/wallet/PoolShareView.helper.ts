import { getValueOfAsset1InAsset2, getValueOfRuneInAsset, PoolData } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolShareTableData } from '../../components/PoolShares/PoolShares.types'
import * as ShareHelpers from '../../helpers/poolShareHelper'
import { PoolDetails, PoolShares } from '../../services/midgard/types'
import { getPoolDetail, toPoolData } from '../../services/midgard/utils'

export const getPoolShareTableData = (
  shares: PoolShares,
  poolDetails: PoolDetails,
  pricePoolData: PoolData
): PoolShareTableData =>
  FP.pipe(
    shares,
    A.filterMap(({ units, asset, type }) =>
      FP.pipe(
        getPoolDetail(poolDetails, asset),
        O.map((poolDetail) => {
          const runeShare = ShareHelpers.getRuneShare(units, poolDetail)
          // FIXME: (@Veado) Fix decimal
          // https://github.com/thorchain/asgardex-electron/issues/1163
          const assetShare = ShareHelpers.getAssetShare({
            liquidityUnits: units,
            detail: poolDetail,
            assetDecimal: 8 /* FIXME: see previous comment ^ */
          })
          const sharePercent = ShareHelpers.getPoolShare(units, poolDetail)
          const poolData = toPoolData(poolDetail)
          const assetDepositPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
          const runeDepositPrice = getValueOfRuneInAsset(runeShare, pricePoolData)

          return {
            asset,
            runeShare,
            assetShare,
            sharePercent,
            assetDepositPrice,
            runeDepositPrice,
            type
          }
        })
      )
    )
  )
