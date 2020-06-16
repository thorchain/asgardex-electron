import { getAssetFromString } from '@thorchain/asgardex-util'

import { CURRENCY_SYMBOLS, CURRENCY_WHEIGHTS, RUNE_TICKER } from '../../const'
import { PoolDetails } from '../../services/midgard/types'
import { PoolDetail } from '../../types/generated/midgard'
import { PoolPriceAssets, PoolPriceAsset, PoolAsset } from '../../views/pools/types'
import { HeaderCurrencyItems, HeaderCurrencyItem } from './HeaderCurrency'

export const toHeaderCurrencyItems = (pools: PoolDetails, whitelist: PoolPriceAssets): HeaderCurrencyItems => {
  const pricePools = pools.filter(
    (detail) => whitelist.find((asset) => detail.asset && detail.asset === asset) !== undefined
  )

  const runeItem: HeaderCurrencyItem = {
    label: `${CURRENCY_SYMBOLS[PoolAsset.RUNE]} ${RUNE_TICKER}`,
    value: PoolAsset.RUNE
  }

  return (
    pricePools
      .map((pool: PoolDetail) => {
        // Since we have filtered pools based on whitelist before ^,
        // we can type asset as PriceAsset now
        const asset = pool?.asset as PoolPriceAsset
        let ticker = getAssetFromString(asset)?.ticker ?? 'unknown'
        // special case TUSDB
        if (asset === PoolAsset.TUSDB) ticker = 'USD'
        return {
          label: `${CURRENCY_SYMBOLS[asset]} ${ticker}`,
          value: asset
        } as HeaderCurrencyItem
      })
      // add RUNE item
      .concat([runeItem])
      // sort by weights (high weight wins)
      .sort((a, b) => CURRENCY_WHEIGHTS[b.value] - CURRENCY_WHEIGHTS[a.value])
  )
}
