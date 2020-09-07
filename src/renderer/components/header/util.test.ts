import * as O from 'fp-ts/lib/Option'

import { OnlineStatus } from '../../services/app/types'
import { PoolAsset } from '../../views/pools/types'
import { toHeaderCurrencyLabel, headerNetStatusSubheadline, headerNetStatusColor } from './util'

describe('header/util', () => {
  describe('toHeaderCurrencyItem', () => {
    it('returns label for RUNE', () => {
      const result = toHeaderCurrencyLabel(PoolAsset.RUNE67C)
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
      expect(toHeaderCurrencyLabel(PoolAsset.BUSDBD1)).toEqual('$ USD')
      expect(toHeaderCurrencyLabel(PoolAsset.BUSDBAF)).toEqual('$ USD')
    })
  })

  describe('headerNetStatusSubheadline', () => {
    it('is hostname if online', () => {
      const result = headerNetStatusSubheadline({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.ON,
        notConnectedTxt: ''
      })
      expect(result).toEqual('localhost')
    })
    it('its "not connected text if offline" ', () => {
      const result = headerNetStatusSubheadline({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.OFF,
        notConnectedTxt: 'not connected'
      })
      expect(result).toEqual('not connected')
    })
    it('its "not connected text if no url is available" ', () => {
      const result = headerNetStatusSubheadline({
        url: O.none,
        onlineStatus: OnlineStatus.ON,
        notConnectedTxt: 'not connected'
      })
      expect(result).toEqual('not connected')
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
      expect(toHeaderCurrencyLabel(PoolAsset.BUSDBAF)).toEqual('$ USD')
      expect(toHeaderCurrencyLabel(PoolAsset.BUSDBD1)).toEqual('$ USD')
    })
  })

  describe('headerNetStatusColor', () => {
    it('green', () => {
      const result = headerNetStatusColor({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.ON
      })
      expect(result).toEqual('green')
    })
    it('red', () => {
      const result = headerNetStatusColor({
        url: O.some('http://localhost'),
        onlineStatus: OnlineStatus.OFF
      })
      expect(result).toEqual('red')
    })
    it('yellow', () => {
      const result = headerNetStatusColor({
        url: O.none,
        onlineStatus: OnlineStatus.ON
      })
      expect(result).toEqual('yellow')
    })
  })
})
