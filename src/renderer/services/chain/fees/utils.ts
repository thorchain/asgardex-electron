import { ETH_DECIMAL } from '@xchainjs/xchain-ethereum'
import { Asset, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'

import {
  BNB_DECIMAL,
  isBchAsset,
  isBnbAsset,
  isBtcAsset,
  isEthAsset,
  isEthTokenAsset,
  isLtcAsset
} from '../../../helpers/assetHelper'

/**
 *
 * Helper to get inbound fee for
 *
 * @see Better Fees Handling #1381
 * https://github.com/thorchain/asgardex-electron/issues/1381#issuecomment-827513798
 */
export const getInboundFee = ({ gasRate, asset }: { gasRate: BigNumber; asset: Asset }): O.Option<BaseAmount> => {
  const gasRateGwei = gasRate.multipliedBy(10 ** 9)

  if (isBnbAsset(asset)) {
    // BNB = 1 * gasRate (sat/byte) * 1 (bytes)
    return O.some(baseAmount(gasRate, BNB_DECIMAL))
  } else if (isBtcAsset(asset) || isBchAsset(asset) || isLtcAsset(asset)) {
    // BTC/LTC/BCH = 1 * gasRate (sat/byte) * 250 (bytes)
    return O.some(baseAmount(gasRate.multipliedBy(250), 8))
  } else if (isEthAsset(asset)) {
    // ETH = 1 * gasRate * 10^9 (GWEI) * 35000 (units)

    return O.some(baseAmount(gasRateGwei.multipliedBy(35000), ETH_DECIMAL))
  } else if (isEthTokenAsset(asset)) {
    // ERC20 = 1 * gasRate * 10^9 (GWEI) * 70000 (units)
    return O.some(baseAmount(gasRateGwei.multipliedBy(70000), ETH_DECIMAL))
  } else {
    return O.none
  }
}

/**
 *
 * Helper to get outbound fee for
 *
 * @see Better Fees Handling #1381
 * https://github.com/thorchain/asgardex-electron/issues/1381#issuecomment-827513798
 */
export const getOutboundFee = ({ gasRate, asset }: { gasRate: BigNumber; asset: Asset }): O.Option<BaseAmount> => {
  // BTC/LTC/BCH = 3 * gasRate (sat/byte) * 250 (bytes)
  // BNB = 3 * gasRate (sat/byte) * 1 (bytes)
  // ETH = 3 * gasRate*10^9 (GWEI) * 35000 (units)
  // ERC20 = 3 * gasRate*10^9 (GWEI) * 70000 (units)

  const outGasRate = gasRate.multipliedBy(3)
  const gasRateGwei = outGasRate.multipliedBy(10 ** 9)

  if (isBnbAsset(asset)) {
    // BNB = 3 * gasRate (sat/byte) * 1 (bytes)
    return O.some(baseAmount(outGasRate, BNB_DECIMAL))
  } else if (isBtcAsset(asset) || isBchAsset(asset) || isLtcAsset(asset)) {
    // BTC/LTC/BCH = 3 * gasRate (sat/byte) * 250 (bytes)
    return O.some(baseAmount(outGasRate.multipliedBy(250), 8))
  } else if (isEthAsset(asset)) {
    // ETH = 3 * gasRate * 10^9 (GWEI) * 35000 (units)
    return O.some(baseAmount(gasRateGwei.multipliedBy(35000), ETH_DECIMAL))
  } else if (isEthTokenAsset(asset)) {
    // ERC20 = 3 * gasRate * 10^9 (GWEI) * 70000 (units)
    return O.some(baseAmount(gasRateGwei.multipliedBy(70000), ETH_DECIMAL))
  } else {
    return O.none
  }
}
