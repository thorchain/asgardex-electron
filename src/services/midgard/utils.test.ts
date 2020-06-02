import { bn } from '@thorchain/asgardex-util'

import { ThorchainEndpoint, PoolDetail } from '../../types/generated/midgard'
import { PriceDataIndex } from './types'
import { getAssetFromString, getAssetDetailIndex, getPriceIndex, toPoolDetailsMap } from './utils'

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

  describe('getPriceIndex', () => {
    it('should return prices indexes based on RUNE price', () => {
      const result = getPriceIndex(
        [
          { asset: 'BNB.TOMOB-1E1', priceRune: '0.3333333333333333' },
          { asset: 'BNB.BBB', priceRune: '2206.896551724138' }
        ],
        'AAA'
      )
      const expected: PriceDataIndex = {
        RUNE: bn(1),
        TOMOB: bn('0.3333333333333333'),
        BBB: bn('2206.896551724138')
      }
      expect(result).toEqual(expected)
    })
    it('should return a prices indexes based on BBB price', () => {
      const result = getPriceIndex(
        [
          { asset: 'AAA.AAA-AAA', priceRune: '4' },
          { asset: 'BBB.BBB-BBB', priceRune: '2' },
          { asset: 'CCC.CCC-CCC', priceRune: '10' }
        ],
        'BBB'
      )
      const expected: PriceDataIndex = {
        RUNE: bn(0.5),
        AAA: bn(2),
        BBB: bn(1),
        CCC: bn(5)
      }
      expect(result).toEqual(expected)
    })
  })

  describe('getAssetFromString', () => {
    it('should return an asset with all values', () => {
      const result = getAssetFromString('BNB.RUNE-B1A')
      expect(result).toEqual({
        chain: 'BNB',
        symbol: 'RUNE-B1A',
        ticker: 'RUNE'
      })
    })
    it('should return an asset with all values, even if chain and symbol are provided only', () => {
      const result = getAssetFromString('BNB.RUNE')
      expect(result).toEqual({ chain: 'BNB', symbol: 'RUNE', ticker: 'RUNE' })
    })
    it('should return an asset with a value for chain only', () => {
      const result = getAssetFromString('BNB')
      expect(result).toEqual({ chain: 'BNB' })
    })
    it('returns an asset without any values if the passing value is an empty string', () => {
      const result = getAssetFromString('')
      expect(result).toEqual({})
    })
    it('returns an asset without any values if the passing value is undefined', () => {
      const result = getAssetFromString(undefined)
      expect(result).toEqual({})
    })
  })

  describe('toPoolDetailsMap', () => {
    const bnb: PoolDetail = { asset: 'BNB.BNB' }
    const tusdb: PoolDetail = { asset: 'BNB.TUSDB-000' }
    const tcan: PoolDetail = { asset: 'BNB.TCAN-014' }
    const details = [bnb, tusdb, tcan]

    it('creates a PoolDetailsMap ', () => {
      const expected = { BNB: bnb, 'TUSDB-000': tusdb, 'TCAN-014': tcan }
      const result = toPoolDetailsMap(details)
      expect(result).toEqual(expected)
    })
    it('creates an empty PoolDetailsMap from empty details', () => {
      const expected = {}
      const result = toPoolDetailsMap([])
      expect(result).toEqual(expected)
    })
  })
})
