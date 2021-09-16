import { AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import { AssetBUSDBAF, AssetBUSDBD1 } from '../../const'
import { toHeaderCurrencyLabel, headerNetStatusSubheadline, headerNetStatusColor } from './Header.util'

describe('header/util', () => {
  describe('toHeaderCurrencyItem', () => {
    it('returns label for RUNE', () => {
      expect(toHeaderCurrencyLabel(AssetRuneNative)).toEqual('ᚱ RUNE')
    })

    it('returns label for BTC', () => {
      const result = toHeaderCurrencyLabel(AssetBTC)
      expect(result).toEqual('₿ BTC')
    })

    it('returns label for ETH', () => {
      const result = toHeaderCurrencyLabel(AssetETH)
      expect(result).toEqual('Ξ ETH')
    })

    it('returns label for TUSDB', () => {
      expect(toHeaderCurrencyLabel(AssetBUSDBD1)).toEqual('$ USD')
      expect(toHeaderCurrencyLabel(AssetBUSDBAF)).toEqual('$ USD')
    })
  })

  describe('headerNetStatusSubheadline', () => {
    it('if online status is true', () => {
      const result = headerNetStatusSubheadline({
        url: 'localhost',
        onlineStatus: true,
        notConnectedTxt: ''
      })
      expect(result).toEqual('localhost')
    })
    it('if online status is false" ', () => {
      const result = headerNetStatusSubheadline({
        url: 'localhost',
        onlineStatus: false,
        notConnectedTxt: 'not connected'
      })
      expect(result).toEqual('not connected')
    })

    it('returns label for BTC', () => {
      const result = toHeaderCurrencyLabel(AssetBTC)
      expect(result).toEqual('₿ BTC')
    })

    it('returns label for ETH', () => {
      const result = toHeaderCurrencyLabel(AssetETH)
      expect(result).toEqual('Ξ ETH')
    })

    it('returns label for TUSDB', () => {
      expect(toHeaderCurrencyLabel(AssetBUSDBAF)).toEqual('$ USD')
      expect(toHeaderCurrencyLabel(AssetBUSDBD1)).toEqual('$ USD')
    })
  })

  describe('headerNetStatusColor', () => {
    it('green', () => {
      const result = headerNetStatusColor({
        onlineStatus: true
      })
      expect(result).toEqual('green')
    })
    it('red', () => {
      const result = headerNetStatusColor({
        onlineStatus: false
      })
      expect(result).toEqual('red')
    })
  })
})
