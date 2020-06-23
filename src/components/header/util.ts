import { getAssetFromString } from '@thorchain/asgardex-util'

import { CURRENCY_SYMBOLS } from '../../const'
import { PoolAsset, PricePoolAsset } from '../../views/pools/types'

export const toHeaderCurrencyLabel = (asset: PricePoolAsset): string => {
  let ticker = getAssetFromString(asset)?.ticker ?? 'unknown'
  // special case TUSDB
  if (asset === PoolAsset.TUSDB) ticker = 'USD'
  return `${CURRENCY_SYMBOLS[asset]} ${ticker}`
}
