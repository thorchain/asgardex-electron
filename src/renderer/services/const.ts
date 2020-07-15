import * as path from 'path'

import { remote } from 'electron'

import { PricePoolAssets, PoolAsset } from '../views/pools/types'

export const APP_NAME = remote?.app?.name ?? 'ASGARDEX'

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [PoolAsset.BTC, PoolAsset.ETH, PoolAsset.TUSDB]

export const APP_DATA_DIR = path.join(
  remote?.app?.getPath('appData') ?? './testdata', // we can't access remote.app in tests
  APP_NAME
)
export const STORAGE_DIR = path.join(APP_DATA_DIR, 'storage')
