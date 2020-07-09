import { getAssetFromString, Asset } from '@thorchain/asgardex-util'

import { PoolAsset } from '../views/pools/types'

type Assets = 'RUNE' | 'BNB' | 'FTM' | 'TOMO' | 'BOLT'

type AssetsTestnet = Record<Assets, Asset>
type AssetsMainnet = Record<Assets, Asset>

export const ASSETS_TESTNET: AssetsTestnet = {
  RUNE: getAssetFromString(PoolAsset.RUNE),
  BNB: getAssetFromString(PoolAsset.BNB),
  FTM: getAssetFromString('BNB.FTM-585'),
  TOMO: getAssetFromString('BNB.TOMOB-1E1'),
  BOLT: getAssetFromString('BNB.BOLT-E42')
}

export const ASSETS_MAINNET: AssetsMainnet = {
  RUNE: getAssetFromString('BNB.RUNE-B1A'),
  BNB: getAssetFromString(PoolAsset.BNB),
  FTM: getAssetFromString('BNB.FTM-A64'),
  TOMO: getAssetFromString('BNB.TOMOB-4BC'),
  BOLT: getAssetFromString('BNB.BOLT-4C6')
}
