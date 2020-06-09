// import { baseAmount } from '@thorchain/asgardex-token'
import { bn } from '@thorchain/asgardex-util'

import { PriceDataIndex } from '../../services/midgard/types'
import { PoolDetail, PoolDetailStatusEnum } from '../../types/generated/midgard/models/PoolDetail'
import { PoolDataType } from './types'
import { getPoolData } from './utils'

describe('poolUtil', () => {
  describe('getPoolData', () => {
    const bnbPoolDetail: PoolDetail = {
      asset: 'BNB.BNB',
      assetDepth: '611339',
      assetROI: '-0.4442372727272727',
      assetStakedTotal: '1100000',
      buyAssetCount: '1',
      buyFeeAverage: '199600',
      buyFeesTotal: '199600',
      buySlipAverage: '1002000',
      buyTxAverage: '32387',
      buyVolume: '32387',
      poolDepth: '399999598',
      poolFeeAverage: '99800',
      poolFeesTotal: '199600',
      poolROI: '999.2768763636363',
      poolROI12: '1000.2778813636363',
      poolSlipAverage: '501000',
      poolStakedTotal: '359965441',
      poolTxAverage: '16193',
      poolUnits: '47400323',
      poolVolume: '32387',
      poolVolume24hr: '0',
      price: '327.15040100500704',
      runeDepth: '199999799',
      runeROI: '1998.99799',
      runeStakedTotal: '100000',
      sellAssetCount: '0',
      sellFeeAverage: '0',
      sellFeesTotal: '0',
      sellSlipAverage: '0',
      sellTxAverage: '0',
      sellVolume: '0',
      stakeTxCount: '3',
      stakersCount: '1',
      stakingTxCount: '4',
      status: PoolDetailStatusEnum.Enabled,
      swappersCount: '1',
      swappingTxCount: '1',
      withdrawTxCount: '1'
    }

    const fsnPoolDetail: PoolDetail = {
      asset: 'BNB.FSN-F1B',
      assetDepth: '100000',
      assetROI: '0',
      assetStakedTotal: '100000',
      buyAssetCount: '0',
      buyFeeAverage: '0',
      buyFeesTotal: '0',
      buySlipAverage: '0',
      buyTxAverage: '0',
      buyVolume: '0',
      poolDepth: '400000',
      poolFeeAverage: '0',
      poolFeesTotal: '0',
      poolROI: '0.5',
      poolROI12: '0.5',
      poolSlipAverage: '0',
      poolStakedTotal: '300000',
      poolTxAverage: '0',
      poolUnits: '87500',
      poolVolume: '0',
      poolVolume24hr: '0',
      price: '2',
      runeDepth: '200000',
      runeROI: '1',
      runeStakedTotal: '100000',
      sellAssetCount: '0',
      sellFeeAverage: '0',
      sellFeesTotal: '0',
      sellSlipAverage: '0',
      sellTxAverage: '0',
      sellVolume: '0',
      stakeTxCount: '2',
      stakersCount: '1',
      stakingTxCount: '2',
      status: PoolDetailStatusEnum.Enabled,
      swappersCount: '0',
      swappingTxCount: '0',
      withdrawTxCount: '0'
    }
    const priceIndex: PriceDataIndex = {
      RUNE: bn(1),
      FSN: bn(2)
    }
    it('returns PoolData for a FSN based pool', () => {
      const expected: PoolDataType = {
        pool: {
          asset: 'RUNE',
          target: 'FSN'
        },
        poolPrice: 'RUNE 2.000',
        depth: 'RUNE 0.00',
        volume: 'RUNE 0.00',
        transaction: 'RUNE 0.00',
        slip: '0',
        trade: '0',
        raw: {
          depth: bn(200000),
          volume: bn(0),
          transaction: bn(0),
          slip: bn(0),
          trade: bn(0),
          poolPrice: bn(2)
        }
      }
      const result = getPoolData('RUNE', fsnPoolDetail, priceIndex, 'RUNE')
      const rRaw = result.raw
      const eRaw = expected.raw

      expect(result.pool.asset).toEqual(expected.pool.asset)
      expect(result.pool.target).toEqual(expected.pool.target)
      expect(result.depth).toEqual(expected.depth)
      expect(result.volume).toEqual(expected.volume)
      expect(result.transaction).toEqual(expected.transaction)
      expect(result.slip).toEqual(expected.slip)
      expect(result.trade).toEqual(expected.trade)

      expect(rRaw.depth).toEqual(eRaw.depth)
      expect(rRaw.volume).toEqual(eRaw.volume)
      expect(rRaw.transaction).toEqual(eRaw.transaction)
      expect(rRaw.slip).toEqual(eRaw.slip)
      expect(rRaw.trade).toEqual(eRaw.trade)
      expect(rRaw.poolPrice).toEqual(eRaw.poolPrice)
    })
    it('returns PoolData for a BNB based pool', () => {
      const expected: PoolDataType = {
        pool: {
          asset: 'RUNE',
          target: 'BNB'
        },
        poolPrice: 'RUNE 0.000',
        depth: 'RUNE 2.00',
        volume: 'RUNE 0.00',
        transaction: 'RUNE 0.00',
        slip: '50100000',
        trade: '1',
        raw: {
          depth: bn(199999799),
          volume: bn(0),
          transaction: bn(16193),
          slip: bn(50100000),
          trade: bn(1),
          poolPrice: bn(0)
        }
      }
      const result = getPoolData('RUNE', bnbPoolDetail, priceIndex, 'RUNE')
      const rRaw = result.raw
      const eRaw = expected.raw

      expect(result.pool.asset).toEqual(expected.pool.asset)
      expect(result.pool.target).toEqual(expected.pool.target)
      expect(result.depth).toEqual(expected.depth)
      expect(result.volume).toEqual(expected.volume)
      expect(result.transaction).toEqual(expected.transaction)
      expect(result.slip).toEqual(expected.slip)
      expect(result.trade).toEqual(expected.trade)

      expect(rRaw.depth).toEqual(eRaw.depth)
      expect(rRaw.volume).toEqual(eRaw.volume)
      expect(rRaw.transaction).toEqual(eRaw.transaction)
      expect(rRaw.slip).toEqual(eRaw.slip)
      expect(rRaw.trade).toEqual(eRaw.trade)
      expect(rRaw.poolPrice).toEqual(eRaw.poolPrice)
    })
  })
})
