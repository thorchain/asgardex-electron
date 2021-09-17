import { AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import { AssetBUSDBAF, AssetBUSDBD1 } from '../../const'
import { OnlineStatus } from '../../services/app/types'
import { toHeaderCurrencyLabel, headerNetStatusSubheadline, headerNetStatusColor, isClientOnline } from './Header.util'

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
        onlineStatus: OnlineStatus.ON,
        notConnectedTxt: ''
      })
      expect(result).toEqual('localhost')
    })
    it('if online status is false" ', () => {
      const result = headerNetStatusSubheadline({
        url: 'localhost',
        onlineStatus: OnlineStatus.OFF,
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
        onlineStatus: OnlineStatus.ON
      })
      expect(result).toEqual('green')
    })
    it('red', () => {
      const result = headerNetStatusColor({
        onlineStatus: OnlineStatus.OFF
      })
      expect(result).toEqual('red')
    })
  })

  describe('isClientOnline', () => {
    it('midgard and thorchain are online', () => {
      const result = isClientOnline(OnlineStatus.ON, OnlineStatus.ON)
      expect(result).toBeTruthy()
    })
    it('midgard is offline and thorchain is online', () => {
      const result = isClientOnline(OnlineStatus.OFF, OnlineStatus.ON)
      expect(result).toBeFalsy()
    })
    it('midgard is online and thorchain is offline', () => {
      const result = isClientOnline(OnlineStatus.ON, OnlineStatus.OFF)
      expect(result).toBeFalsy()
    })
    it('midgard and thorchain are offline', () => {
      const result = isClientOnline(OnlineStatus.OFF, OnlineStatus.OFF)
      expect(result).toBeFalsy()
    })
  })
})
