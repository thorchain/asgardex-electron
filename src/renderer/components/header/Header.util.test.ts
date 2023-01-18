import * as O from 'fp-ts/lib/Option'

import { AssetBTC, AssetETH, AssetRuneNative } from '../../../shared/utils/asset'
import { AssetBUSDBAF, AssetBUSDBD1 } from '../../const'
import { OnlineStatus } from '../../services/app/types'
import {
  toHeaderCurrencyLabel,
  headerNetStatusSubheadline,
  headerNetStatusColor,
  appOnlineStatusColor
} from './Header.util'

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
    it('if online status is true and client is online', () => {
      const result = headerNetStatusSubheadline({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.ON,
        clientStatus: OnlineStatus.ON,
        notConnectedTxt: ''
      })
      expect(result).toEqual('localhost')
    })
    it('if online status is true  and client is offline ', () => {
      const result = headerNetStatusSubheadline({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.ON,
        clientStatus: OnlineStatus.OFF,
        notConnectedTxt: 'not connected'
      })
      expect(result).toEqual('not connected')
    })
    it('if online status is false  and client is offline ', () => {
      const result = headerNetStatusSubheadline({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.OFF,
        clientStatus: OnlineStatus.OFF,
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
        onlineStatus: OnlineStatus.ON,
        clientStatus: OnlineStatus.ON
      })
      expect(result).toEqual('green')
    })
    it('yellow', () => {
      const result = headerNetStatusColor({
        onlineStatus: OnlineStatus.ON,
        clientStatus: OnlineStatus.OFF
      })
      expect(result).toEqual('yellow')
    })
    it('red', () => {
      const result = headerNetStatusColor({
        onlineStatus: OnlineStatus.OFF,
        clientStatus: OnlineStatus.ON
      })
      expect(result).toEqual('red')
    })
    it('red', () => {
      const result = headerNetStatusColor({
        onlineStatus: OnlineStatus.OFF,
        clientStatus: OnlineStatus.OFF
      })
      expect(result).toEqual('red')
    })
  })

  describe('appOnlineStatusColor', () => {
    it('app not online', () => {
      const result = appOnlineStatusColor({
        onlineStatus: OnlineStatus.OFF,
        midgardStatus: OnlineStatus.ON,
        thorchainStatus: OnlineStatus.ON
      })
      expect(result).toEqual('red')
    })
    it('only midgard not reachable', () => {
      const result = appOnlineStatusColor({
        onlineStatus: OnlineStatus.ON,
        midgardStatus: OnlineStatus.OFF,
        thorchainStatus: OnlineStatus.ON
      })
      expect(result).toEqual('yellow')
    })
    it('only thorchain not reachable', () => {
      const result = appOnlineStatusColor({
        onlineStatus: OnlineStatus.ON,
        midgardStatus: OnlineStatus.ON,
        thorchainStatus: OnlineStatus.OFF
      })
      expect(result).toEqual('yellow')
    })
    it('nothing available', () => {
      const result = appOnlineStatusColor({
        onlineStatus: OnlineStatus.OFF,
        midgardStatus: OnlineStatus.OFF,
        thorchainStatus: OnlineStatus.OFF
      })
      expect(result).toEqual('red')
    })
    it('everything fine', () => {
      const result = appOnlineStatusColor({
        onlineStatus: OnlineStatus.ON,
        midgardStatus: OnlineStatus.ON,
        thorchainStatus: OnlineStatus.ON
      })
      expect(result).toEqual('green')
    })
  })
})
