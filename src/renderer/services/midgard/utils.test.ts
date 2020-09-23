import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, AssetBTC, AssetTicker, assetToString } from '@thorchain/asgardex-util'
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
  filterPoolAssets,
  getPoolDetailsHashMap
} from './utils'

type PoolDataMock = { asset?: string }

describe('services/midgard/utils/', () => {
  describe('getAssetDetailIndex', () => {
    const emptyAsset = {}
    const emptyAssetSymbol: PoolDataMock = { asset: 'AAA' }

    it('should return non empty assetDataIndex ', () => {
      const bnbData: ThorchainEndpoint = { chain: 'BNB', address: '0xbnb' }
      const asset1: PoolDataMock = { asset: assetToString(AssetBNB) }
      const asset2: PoolDataMock = { asset: assetToString(AssetBTC) }
      const data = [bnbData, asset1, asset2, emptyAsset, emptyAssetSymbol] as Array<PoolDataMock>
      const result = getAssetDetailIndex(data)
      const expected = {
        BNB: asset1,
        BTC: asset2
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
    const BUSDBAF: PoolDetail = { asset: 'BNB.BUSD-BAF', assetDepth: '3', runeDepth: '33' }
    const btc: PoolDetail = { asset: 'BTC.BTC', assetDepth: '4', runeDepth: '44' }
    const lok: PoolDetail = { asset: 'BNB.LOK-3C0', assetDepth: '5', runeDepth: '5' }

    it('returns list of price pools in a right order', () => {
      const result = getPricePools([tomob, eth, BUSDBAF, btc, lok], PRICE_POOLS_WHITELIST)
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
      // BUSDBAF pool
      const busdPool = result[3]
      expect(busdPool.asset).toEqual(PoolAsset.BUSDBAF)
      expect(busdPool.poolData.runeBalance.amount().toNumber()).toEqual(33)
      expect(busdPool.poolData.assetBalance.amount().toNumber()).toEqual(3)
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
    const BUSDBAF: PricePool = { asset: PoolAsset.BUSDBAF, poolData }
    const btc: PricePool = { asset: PoolAsset.BTC, poolData }

    it('selects ETH pool', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, eth, BUSDBAF, btc], O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.ETH)
    })

    it('selects BUSDBAF pool if ETH pool is not available', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, BUSDBAF, btc], O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.BUSDBAF)
    })

    it('selects BUSDBAF by default if no selection has been done', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, eth, BUSDBAF, btc], O.none)
      expect(pool.asset).toEqual(PoolAsset.BUSDBAF)
    })

    it('selects RUNE if ETH + BUSDBAF pools are not available', () => {
      const pool = pricePoolSelector([RUNE_PRICE_POOL, btc], O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.RUNE67C)
    })
  })

  describe('pricePoolSelectorFromRD', () => {
    const poolData = toPoolData({})
    const eth: PricePool = { asset: PoolAsset.ETH, poolData }
    const BUSDBAF: PricePool = { asset: PoolAsset.BUSDBAF, poolData }
    const btc: PricePool = { asset: PoolAsset.BTC, poolData }
    const mockPoolsStateSuccess = (pricePools: PricePools): PoolsStateRD =>
      RD.success({
        assetDetails: [],
        poolAssets: [],
        poolDetails: [],
        pricePools: O.some(pricePools)
      } as PoolsState)

    it('selects ETH pool', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, eth, BUSDBAF, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.ETH)
    })

    it('selects BUSDBAF pool if ETH pool is not available', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, BUSDBAF, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(PoolAsset.ETH))
      expect(pool.asset).toEqual(PoolAsset.BUSDBAF)
    })

    it('selects BUSDBAF by default if no selection has been done', () => {
      const poolsRD = mockPoolsStateSuccess([RUNE_PRICE_POOL, eth, BUSDBAF, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.none)
      expect(pool.asset).toEqual(PoolAsset.BUSDBAF)
    })

    it('selects RUNE if ETH + BUSDBAF pools are not available', () => {
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

  describe('getPoolDetailsHashMap', () => {
    const runeDetail: PoolDetail = { asset: PoolAsset.RUNE67C }
    const bnbDetail: PoolDetail = { asset: PoolAsset.BNB }

    it('returns hashMap of pool details', () => {
      const result = getPoolDetailsHashMap([runeDetail, bnbDetail])

      /**
       * Compare stringified structures 'cause
       * Jest compares amount's getter functions by
       * pointers and jest.mock does not work in terms
       * of single describe (only as global mock for file)
       */
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          [PoolAsset.RUNE67C]: toPoolData(runeDetail),
          [PoolAsset.BNB]: toPoolData(bnbDetail)
        })
      )
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
