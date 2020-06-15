import { RUNE_TICKER } from '../../const'
import { ThorchainEndpoint, AssetDetail } from '../../types/generated/midgard'
import { getAssetDetailIndex, getAssetDetail } from './utils'

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
    const runeDetail: AssetDetail = { asset: 'BNB.RUNE-B1A' }
    const bnbDetail: AssetDetail = { asset: 'BNB.BNB' }

    it('returns details of RUNE', () => {
      const result = getAssetDetail([runeDetail, bnbDetail], RUNE_TICKER)
      expect(result).toEqual(runeDetail)
    })
    it('returns Nothing if no RUNE details available', () => {
      const result = getAssetDetail([bnbDetail], 'TOMOB')
      expect(result).toBeNothing()
    })
  })
})
