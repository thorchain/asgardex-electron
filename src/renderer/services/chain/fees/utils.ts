import { getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { DOGE_DECIMAL } from '@xchainjs/xchain-doge'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  baseAmount,
  assetToString,
  BaseAmount,
  AssetDOGE
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'

import {
  BNB_DECIMAL,
  convertBaseAmountDecimal,
  isBchAsset,
  isBtcAsset,
  isDogeAsset,
  isEthAsset,
  isEthTokenAsset,
  isLtcAsset,
  isRuneNativeAsset,
  to1e8BaseAmount
} from '../../../helpers/assetHelper'
import { isBnbChain } from '../../../helpers/chainHelper'
import { eqAsset } from '../../../helpers/fp/eq'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { RUNE_POOL_DATA } from '../../../helpers/poolHelper'
import { AssetWithAmount } from '../../../types/asgardex'
import { PoolsDataMap } from '../../midgard/types'

/**
 *
 * Helper to get chain fees by given `gasRate` and `asset`
 *
 * Formulas based on "Better Fees Handling #1381"
 * @see https://github.com/thorchain/asgardex-electron/issues/1381#issuecomment-827513798
 */
export const getChainFeeByGasRate = ({
  gasRate,
  asset
}: {
  gasRate: BigNumber
  asset: Asset
}): O.Option<AssetWithAmount> => {
  const gasRateGwei = gasRate.multipliedBy(10 ** 9)

  if (isBnbChain(asset.chain)) {
    // BNB = 1 * gasRate (sat/byte) * 1 (bytes)
    return O.some({
      amount: baseAmount(gasRate, BNB_DECIMAL),
      asset: AssetBNB
    })
  } else if (isBtcAsset(asset)) {
    // BTC = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), BTC_DECIMAL),
      asset: AssetBTC
    })
  } else if (isBchAsset(asset)) {
    // BCH (similar to BTC) = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), BCH_DECIMAL),
      asset: AssetBCH
    })
  } else if (isLtcAsset(asset)) {
    // LTC (similar to BTC)  = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), LTC_DECIMAL),
      asset: AssetLTC
    })
  } else if (isDogeAsset(asset)) {
    // DOGE (similar to BTC)  = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), DOGE_DECIMAL),
      asset: AssetDOGE
    })
  } else if (isEthAsset(asset)) {
    // ETH = 1 * gasRate * 10^9 (GWEI) * 50000 (units)
    return O.some({
      amount: baseAmount(gasRateGwei.multipliedBy(50000), ETH_DECIMAL),
      asset: AssetETH
    })
  } else if (isEthTokenAsset(asset)) {
    // ERC20 = 1 * gasRate * 10^9 (GWEI) * 70000 (units)
    return O.some({
      amount: baseAmount(gasRateGwei.multipliedBy(70000), ETH_DECIMAL),
      asset: AssetETH
    })
  } else {
    return O.none
  }
}

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
