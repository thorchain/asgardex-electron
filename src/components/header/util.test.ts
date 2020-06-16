import { PRICE_POOLS_WHITELIST } from '../../const'
import { PoolDetails } from '../../services/midgard/types'
import { PoolAsset } from '../../views/pools/types'
import { HeaderCurrencyItem } from './HeaderCurrency'
import { toHeaderCurrencyItems } from './util'

describe('header/util', () => {
  describe('toHeaderCurrencyItems', () => {
    const pools: PoolDetails = [
      { asset: 'BNB.TOMOB-1E1' },
      { asset: 'ETH.ETH' },
      { asset: 'BNB.TUSDB-000' },
      { asset: 'BTC.BTC' },
      { asset: 'BNB.LOK-3C0' }
    ]

    const runeItem: HeaderCurrencyItem = { label: 'ᚱ RUNE', value: PoolAsset.RUNE }
    const usdItem: HeaderCurrencyItem = { label: '$ USD', value: PoolAsset.TUSDB }
    const ethItem: HeaderCurrencyItem = { label: 'Ξ ETH', value: PoolAsset.ETH }
    const btcItem: HeaderCurrencyItem = { label: '₿ BTC', value: PoolAsset.BTC }

    it('returns list of CurrencyItems', () => {
      const result = toHeaderCurrencyItems(pools, PRICE_POOLS_WHITELIST)
      expect(result).toEqual([runeItem, btcItem, ethItem, usdItem])
    })
  })
})
