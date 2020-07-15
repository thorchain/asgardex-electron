import { PoolAsset } from '../../views/pools/types'
import { toHeaderCurrencyLabel } from './util'

describe('header/util', () => {
  describe('toHeaderCurrencyItem', () => {
    it('returns label for RUNE', () => {
      const result = toHeaderCurrencyLabel(PoolAsset.RUNE)
      expect(result).toEqual('ᚱ RUNE')
    })

    it('returns label for BTC', () => {
      const result = toHeaderCurrencyLabel(PoolAsset.BTC)
      expect(result).toEqual('₿ BTC')
    })

    it('returns label for ETH', () => {
      const result = toHeaderCurrencyLabel(PoolAsset.ETH)
      expect(result).toEqual('Ξ ETH')
    })

    it('returns label for TUSDB', () => {
      const result = toHeaderCurrencyLabel(PoolAsset.TUSDB)
      expect(result).toEqual('$ USD')
    })
  })
})
