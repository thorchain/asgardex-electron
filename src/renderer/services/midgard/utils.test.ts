import * as RD from '@devexperts/remote-data-ts'
import { AssetTicker } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { PRICE_POOLS_WHITELIST, ONE_ASSET_BASE_AMOUNT, RUNE_PRICE_POOL } from '../../const'
import { ThorchainEndpoint, AssetDetail, PoolDetail } from '../../types/generated/midgard'
import { PoolAsset, PricePool, PricePools } from '../../views/pools/types'
import { PoolsState, PoolsStateRD } from './types'
import {
  getAssetDetailIndex,
  getAssetDetail,
  getPricePools,
  pricePoolSelector,
  pricePoolSelectorFromRD,
  getPoolDetail,
  toPoolData,
  filterPoolAssets
} from './utils'

type PoolDataMock = { asset?: string }

describe('services/midgard/utils/', () => {
  describe('getAssetDetailIndex', () => {
    const emptyAsset = {}
    const emptyAssetSymbol: PoolDataMock = { asset: 'AAA' }

    it('should return non empty assetDataIndex ', () => {
      const bnbData: ThorchainEndpoint = { chain: 'BNB', address: '0xbnb' }
      const asset1: PoolDataMock = { asset: 'A.B-C' }
      const asset2: PoolDataMock = { asset: 'AA.BB-CC' }
      const data = [bnbData, asset1, asset2, emptyAsset, emptyAssetSymbol] as Array<PoolDataMock>
      const result = getAssetDetailIndex(data)
      const expected = {
        'B-C': asset1,
        'BB-CC': asset2
      }
      expect(result).toEqual(expected)
    })
    it('should return an emtpy {} if no asset or symbols in list', () => {
      const data = [emptyAsset, emptyAssetSymbol, emptyAssetSymbol, emptyAssetSymbol, emptyAsset] as Array<PoolDataMock>
      const result = getAssetDetailIndex(data)
      expect(result).toStrictEqual({})
    })
  })

  describe('getAssetDetail', () => {
    const runeDetail: AssetDetail = { asset: PoolAsset.RUNE67C }
    const bnbDetail: AssetDetail = { asset: PoolAsset.BNB }

    it('returns details of RUNE', () => {
      const result = getAssetDetail([runeDetail, bnbDetail], AssetTicker.RUNE)
      expect(result).toEqual(O.some(runeDetail))
    })
    it('returns None if no RUNE details available', () => {
      const result = getAssetDetail([bnbDetail], 'TOMOB')
      expect(result).toBeNone()
    })
  })

  describe('getPricePools', () => {
    const tomob: PoolDetail = { asset: 'BNB.TOMOB-1E1', assetDepth: '1', runeDepth: '11' }
    const eth: PoolDetail = { asset: 'ETH.ETH', assetDepth: '2', runeDepth: '22' }
    const tusdb: PoolDetail = { asset: 'BNB.TUSDB-000', assetDepth: '3', runeDepth: '33' }
    const btc: PoolDetail = { asset: 'BTC.BTC', assetDepth: '4', runeDepth: '44' }
    const lok: PoolDetail = { asset: 'BNB.LOK-3C0', assetDepth: '5', runeDepth: '5' }

    it('returns list of price pools in a right order', () => {
      const result = getPricePools([tomob, eth, tusdb, btc, lok], PRICE_POOLS_WHITELIST)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(PoolAsset.RUNE67C)
      expect(pool0.poolData.runeBalance.amount().toNumber()).toEqual(ONE_ASSET_BASE_AMOUNT.amount().toNumber())
      expect(pool0.poolData.assetBalance.amount().toNumber()).toEqual(ONE_ASSET_BASE_AMOUNT.amount().toNumber())
      // BTC pool
      const btcPool = result[1]
      expect(btcPool.asset).toEqual(PoolAsset.BTC)
      expect(btcPool.poolData.runeBalance.amount().toNumber()).toEqual(44)
      expect(btcPool.poolData.assetBalance.amount().toNumber()).toEqual(4)
      // ETH pool
      const ethPool = result[2]
      expect(ethPool.asset).toEqual(PoolAsset.ETH)
      expect(ethPool.poolData.runeBalance.amount().toNumber()).toEqual(22)
      expect(ethPool.poolData.assetBalance.amount().toNumber()).toEqual(2)
      // TUSDB pool
      const tusdPool = result[3]
      expect(tusdPool.asset).toEqual(PoolAsset.TUSDB)
      expect(tusdPool.poolData.runeBalance.amount().toNumber()).toEqual(33)
      expect(tusdPool.poolData.assetBalance.amount().toNumber()).toEqual(3)
    })

    it('returns RUNE price and btc pools in a right order', () => {
      const result = getPricePools([tomob, lok, btc], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(2)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(PoolAsset.RUNE67C)
      // BTC pool
      const btcPool = result[1]
      expect(btcPool.asset).toEqual(PoolAsset.BTC)
    })

    it('returns RUNE price pool only if another "price" pool is not available', () => {
      const result = getPricePools([tomob, lok], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(1)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(PoolAsset.RUNE67C)
    })
  })

  describe('pricePoolSelector', () => {
    const poolData = toPoolData({})
    const eth: PricePool = { asset: PoolAsset.ETH, poolData }
    const tusdb: PricePool = { asset: PoolAsset.TUSDB, poolData }
    const btc: PricePool = { asset: PoolAsset.BTC, poolData }

    it('selects ETH pool', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, eth, tusdb, btc], O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.ETH)
    })

    it('selects TUSDB pool if ETH pool is not available', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, tusdb, btc], O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.TUSDB)
    })

    it('selects TUSDB by default if no selection has been done', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, eth, tusdb, btc], O.none)
      expect(pool.asset).toEqual(PoolAsset.TUSDB)
    })

    it('selects RUNE if ETH + TUSDB pools are not available', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, btc], O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.RUNE67C)
    })
  })

  describe('pricePoolSelectorFromRD', () => {
    const poolData = toPoolData({})
    const eth: PricePool = { asset: PoolAsset.ETH, poolData }
    const tusdb: PricePool = { asset: PoolAsset.TUSDB, poolData }
    const btc: PricePool = { asset: PoolAsset.BTC, poolData }
    const mockPoolsStateSuccess = (pricePools: PricePools): PoolsStateRD =>
      RD.success({
        assetDetails: [],
        poolAssets: [],
        poolDetails: [],
        pricePools: O.some(pricePools)
      } as PoolsState)

    it('selects ETH pool', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, eth, tusdb, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.ETH)
    })

    it('selects TUSDB pool if ETH pool is not available', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, tusdb, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.TUSDB)
    })

    it('selects TUSDB by default if no selection has been done', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, eth, tusdb, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.none)
      expect(pool.asset).toEqual(PoolAsset.TUSDB)
    })

    it('selects RUNE if ETH + TUSDB pools are not available', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.RUNE67C)
    })

    it('selects RUNE if no other price pool is available', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.RUNE67C)
    })

    it('selects RUNE pool by default if loading other price pools failed', () => {
      const pool = pricePoolSelectorFromRD(RD.failure(new Error('Could not load pools')), O.none)
      expect(pool.asset).toEqual(PoolAsset.RUNE67C)
    })
  })

  describe('getPoolDetail', () => {
    const runeDetail: PoolDetail = { asset: PoolAsset.RUNE67C }
    const bnbDetail: PoolDetail = { asset: PoolAsset.BNB }

    it('returns details of RUNE pool', () => {
      const result = getPoolDetail([runeDetail, bnbDetail], AssetTicker.RUNE)
      expect(result).toEqual(O.some(runeDetail))
    })
    it('returns None if no RUNE details available', () => {
      const result = getPoolDetail([bnbDetail], 'TOMOB')
      expect(result).toBeNone()
    })
  })

  describe('filterPoolAssets', () => {
    it('returns empty list', () => {
      expect(filterPoolAssets([])).toEqual([])
    })
    it('filters out mini tokens', () => {
      expect(filterPoolAssets(['BNB.BNB', 'BNB.MINIA-7A2M', 'BNB.RUNE-B1A'])).toEqual(['BNB.BNB', 'BNB.RUNE-B1A'])
    })
  })
})
