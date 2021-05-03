import { BTC_DECIMAL } from '@xchainjs/xchain-bitcoin'
import { BCH_DECIMAL } from '@xchainjs/xchain-bitcoincash'
import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import { Asset, AssetBCH, AssetBNB, AssetBTC, AssetETH, AssetLTC, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'

import { ZERO_BASE_AMOUNT } from '../../../const'
import {
  BNB_DECIMAL,
  isBchAsset,
  isBtcAsset,
  isEthAsset,
  isEthTokenAsset,
  isLtcAsset
} from '../../../helpers/assetHelper'
import { getChainAsset, isBnbChain } from '../../../helpers/chainHelper'
import { SwapFee, SwapFees } from '../types'

/**
 *
 * Helper to get inbound fee for
 *
 * Formulas based on "Better Fees Handling #1381"
 * @see https://github.com/thorchain/asgardex-electron/issues/1381#issuecomment-827513798
 */
export const getInboundFee = ({ gasRate, asset }: { gasRate: BigNumber; asset: Asset }): O.Option<SwapFee> => {
  const gasRateGwei = gasRate.multipliedBy(10 ** 9)

  if (isBnbChain(asset.chain)) {
    // BNB = 1 * gasRate (sat/byte) * 1 (bytes)
    return O.some({
      amount: baseAmount(gasRate, BNB_DECIMAL),
      asset: AssetBNB
    })
  } else if (isBtcAsset(asset)) {
    // BTC/LTC/BCH = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), BTC_DECIMAL),
      asset: AssetBTC
    })
  } else if (isBchAsset(asset)) {
    // BTC = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), BCH_DECIMAL),
      asset: AssetBCH
    })
  } else if (isLtcAsset(asset)) {
    // LTC = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(gasRate.multipliedBy(250), LTC_DECIMAL),
      asset: AssetLTC
    })
  } else if (isEthAsset(asset)) {
    // ETH = 1 * gasRate * 10^9 (GWEI) * 35000 (units)
    return O.some({
      amount: baseAmount(gasRateGwei.multipliedBy(35000), ETH_DECIMAL),
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

/**
 *
 * Helper to get outbound fee for
 *
 * Formulas based on "Better Fees Handling #1381"
 * @see https://github.com/thorchain/asgardex-electron/issues/1381#issuecomment-827513798
 */
export const getOutboundFee = ({ gasRate, asset }: { gasRate: BigNumber; asset: Asset }): O.Option<SwapFee> => {
  const outGasRate = gasRate.multipliedBy(3)
  const gasRateGwei = outGasRate.multipliedBy(10 ** 9)

  if (isBnbChain(asset.chain)) {
    // BNB = 3 * gasRate (sat/byte) * 1 (bytes)
    return O.some({
      amount: baseAmount(outGasRate, BNB_DECIMAL),
      asset: AssetBNB
    })
  } else if (isBtcAsset(asset)) {
    // BTC = 3 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(outGasRate.multipliedBy(250), BTC_DECIMAL),
      asset: AssetBTC
    })
  } else if (isBchAsset(asset)) {
    // BCH = 3 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(outGasRate.multipliedBy(250), BCH_DECIMAL),
      asset: AssetBCH
    })
  } else if (isLtcAsset(asset)) {
    // LTC = 3 * gasRate (sat/byte) * 250 (bytes)
    return O.some({
      amount: baseAmount(outGasRate.multipliedBy(250), LTC_DECIMAL),
      asset: AssetLTC
    })
  } else if (isEthAsset(asset)) {
    // ETH = 3 * gasRate * 10^9 (GWEI) * 35000 (units)
    return O.some({
      amount: baseAmount(gasRateGwei.multipliedBy(35000), ETH_DECIMAL),
      asset: AssetETH
    })
  } else if (isEthTokenAsset(asset)) {
    // ERC20 = 3 * gasRate * 10^9 (GWEI) * 70000 (units)
    return O.some({
      amount: baseAmount(gasRateGwei.multipliedBy(70000), ETH_DECIMAL),
      asset: AssetETH
    })
  } else {
    return O.none
  }
}

/**
 * Returns zero swap fees
 * by given `in` / `out` assets of a swap
 */
export const getZeroSwapFees = ({ inAsset, outAsset }: { inAsset: Asset; outAsset: Asset }): SwapFees => ({
  inFee: { amount: ZERO_BASE_AMOUNT, asset: getChainAsset(inAsset.chain) },
  outFee: { amount: ZERO_BASE_AMOUNT, asset: getChainAsset(outAsset.chain) }
})
