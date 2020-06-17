import { RUNE_TICKER, PRICE_POOLS_WHITELIST, ONE_ASSET_BASE_AMOUNT } from '../../const'
import { ThorchainEndpoint, AssetDetail, PoolDetail } from '../../types/generated/midgard'
import { PoolAsset } from '../../views/pools/types'
import { getAssetDetailIndex, getAssetDetail, getPricePools } from './utils'

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

  describe('getDetail', () => {
    const runeDetail: AssetDetail = { asset: PoolAsset.RUNE }
    const bnbDetail: AssetDetail = { asset: PoolAsset.BNB }

    it('returns details of RUNE', () => {
      const result = getAssetDetail([runeDetail, bnbDetail], RUNE_TICKER)
      expect(result).toEqual(runeDetail)
    })
    it('returns Nothing if no RUNE details available', () => {
      const result = getAssetDetail([bnbDetail], 'TOMOB')
      expect(result).toBeNothing()
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
      expect(pool0.asset).toEqual(PoolAsset.RUNE)
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
      expect(pool0.asset).toEqual(PoolAsset.RUNE)
      // BTC pool
      const btcPool = result[1]
      expect(btcPool.asset).toEqual(PoolAsset.BTC)
    })

    it('returns RUNE price pool only if another "price" pool is not available', () => {
      const result = getPricePools([tomob, lok], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(1)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(PoolAsset.RUNE)
    })
  })
})
