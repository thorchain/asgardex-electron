import { getValueOfAsset1InAsset2, PoolData } from '@thorchain/asgardex-util'
import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { AssetAtom, COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
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
  isLtcAsset,
  isRuneNativeAsset,
  THORCHAIN_DECIMAL,
  to1e8BaseAmount
} from '../../../helpers/assetHelper'
import { isBnbChain, isCosmosChain, isEthChain } from '../../../helpers/chainHelper'
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
 * incl. updated tx sizes based on information from Bas1c
 * @see https://discord.com/channels/838986635756044328/997675038675316776/998552546392162314
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
    // No change for BNB, just gasRate
    return O.some({
      amount: baseAmount(gasRate, BNB_DECIMAL),
      asset: AssetBNB
    })
  } else if (isBtcAsset(asset)) {
    // BTC = gasRate (sat/byte) * 1000 (tx size)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(1000), BTC_DECIMAL),
      asset: AssetBTC
    })
  } else if (isBchAsset(asset)) {
    // BCH = gasRate (sat/byte) * 1500 (tx size)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(1500), BCH_DECIMAL),
      asset: AssetBCH
    })
  } else if (isLtcAsset(asset)) {
    // LTC = gasRate (sat/byte) * 250 (tx size)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), LTC_DECIMAL),
      asset: AssetLTC
    })
  } else if (isDogeAsset(asset)) {
    // DOGE = gasRate (sat/byte) * 1000 (tx size)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(1000), DOGE_DECIMAL),
      asset: AssetDOGE
    })
  } else if (isEthChain(asset.chain)) {
    // ETH / ERC20 = gasRate * 10^9 (GWEI) * 80000 (units)
    return O.some({
      amount: baseAmount(gasRateGwei.multipliedBy(80000), ETH_DECIMAL),
      asset: AssetETH
    })
  } else if (isCosmosChain(asset.chain)) {
    // No change for ATOM, just gasRate
    // But convertion of decimal is needed: 1e8 (THORChain) -> 1e6 (COSMOS)
    const amount = convertBaseAmountDecimal(baseAmount(gasRate, THORCHAIN_DECIMAL), COSMOS_DECIMAL)
    return O.some({
      amount,
      asset: AssetAtom
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
