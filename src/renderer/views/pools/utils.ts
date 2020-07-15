import {
  EMPTY_ASSET,
  bnOrZero,
  PoolData,
  assetAmount,
  getValueOfAsset1InAsset2,
  baseAmount,
  getValueOfRuneInAsset,
  assetToBase,
  assetFromString
} from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { none, Option, some } from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { toPoolData } from '../../services/midgard/utils'
import { PoolDetail, PoolDetailStatusEnum, ThorchainLastblock, ThorchainConstants } from '../../types/generated/midgard'
import { PoolTableRowData, Pool } from './types'

export const getPoolTableRowData = (poolDetail: PoolDetail, pricePoolData: PoolData): PoolTableRowData => {
  const assetString = poolDetail?.asset ?? ''
  const ticker = assetFromString(assetString)?.ticker ?? ''

  const poolData = toPoolData(poolDetail)

  const oneAsset = assetToBase(assetAmount(1))
  const poolPrice = getValueOfAsset1InAsset2(oneAsset, poolData, pricePoolData)

  const depthAmount = baseAmount(bnOrZero(poolDetail?.runeDepth))
  const depthPrice = getValueOfRuneInAsset(depthAmount, pricePoolData)

  const volumeAmount = baseAmount(bnOrZero(poolDetail?.poolVolume24hr))
  const volumePrice = getValueOfRuneInAsset(volumeAmount, pricePoolData)

  const transaction = baseAmount(bnOrZero(poolDetail?.poolTxAverage))
  const transactionPrice = getValueOfRuneInAsset(transaction, pricePoolData)

  const slip = bnOrZero(poolDetail?.poolSlipAverage).multipliedBy(100)
  const trades = bnOrZero(poolDetail?.swappingTxCount)
  const status = poolDetail?.status ?? PoolDetailStatusEnum.Disabled

  const pool: Pool = {
    // TODO(@Veado): Handle test/mainnet, since RUNE symbol is different
    asset: ASSETS_TESTNET.RUNE,
    target: assetFromString(poolDetail?.asset ?? '') || EMPTY_ASSET
  }

  return {
    pool,
    poolPrice,
    depthPrice,
    volumePrice,
    transactionPrice,
    slip,
    trades,
    status,
    key: ticker
  }
}

export const getBlocksLeftForPendingPool = (
  constants: ThorchainConstants,
  lastblock: ThorchainLastblock
): Option<number> => {
  const newPoolCycle = constants?.int_64_values?.NewPoolCycle
  const lastHeight = lastblock?.thorchain

  if (!newPoolCycle || !lastHeight) return none

  return some(newPoolCycle - (lastHeight % newPoolCycle))
}

export const getBlocksLeftForPendingPoolAsString = (
  constants: ThorchainConstants,
  lastblock: ThorchainLastblock
): string =>
  FP.pipe(
    getBlocksLeftForPendingPool(constants, lastblock),
    O.fold(
      () => '',
      (blocksLeft) => blocksLeft.toString()
    )
  )
