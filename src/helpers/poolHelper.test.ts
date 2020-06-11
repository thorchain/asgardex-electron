import { bn } from '@thorchain/asgardex-util'

import { PriceDataIndex, PoolDetails, PoolsState } from '../services/midgard/types'
import { PoolDetailStatusEnum, PoolDetail } from '../types/generated/midgard'
import { filterPendingPools, getDeepestPool, getPoolViewData } from './poolHelper'

describe('helpers/poolHelper/', () => {
  const pool1: PoolDetail = { status: PoolDetailStatusEnum.Bootstrapped, runeDepth: '1000' }
  const pool2: PoolDetail = { status: PoolDetailStatusEnum.Enabled, runeDepth: '2000' }
  const pool3: PoolDetail = { status: PoolDetailStatusEnum.Disabled, runeDepth: '0' }
  const pool4: PoolDetail = { status: PoolDetailStatusEnum.Bootstrapped, runeDepth: '4000' }

  describe('filterPendingPools', () => {
    const pool4: PoolDetail = { status: PoolDetailStatusEnum.Bootstrapped }

    it('filters pending pools', () => {
      const pools = [pool1, pool2, pool3, pool4]
      const result = filterPendingPools(pools).length
      expect(result).toEqual(2)
    })

    it('does not filter any pending pools', () => {
      const pools = [pool2, pool3]
      const result = filterPendingPools(pools).length
      expect(result).toEqual(0)
    })
  })

  describe('hasPendingPools', () => {
    it('has pending pools', () => {
      const pools = [pool1, pool2, pool3, pool4]
      const result = filterPendingPools(pools).length
      expect(result).toBeTruthy()
    })

    it('has not pending pools', () => {
      const pools = [pool2, pool3]
      const result = filterPendingPools(pools).length
      expect(result).toBeFalsy()
    })
  })

  describe('getDeepestPool', () => {
    it('returns deepest pool', () => {
      const pools = [pool1, pool2, pool4, pool3]
      const result = getDeepestPool(pools)
      expect(result).toEqual(pool4)
    })

    it('does not return a deepest pool by given an empty list of pools', () => {
      const pools: PoolDetails = []
      const result = getDeepestPool(pools)
      expect(result).toBeNothing()
    })
  })

  describe('getPoolViewData', () => {
    const poolDetails: PoolDetails = [
      {
        asset: 'BNB.TOMOB-1E1',
        assetDepth: '18446742858123318865',
        assetROI: '20667660.85795645',
        assetStakedTotal: '1044674093274',
        buyAssetCount: '36',
        buyFeeAverage: '10291935822.907797',
        buyFeesTotal: '370509689624',
        buySlipAverage: '0.13204722398788565',
        buyTxAverage: '84802745137.44766',
        buyVolume: '3052898824948',
        poolDepth: '18446717002400377230',
        poolFeeAverage: '6555438775.205882',
        poolFeesTotal: '445769836714',
        poolROI: '14060601.737624915',
        poolROI12: '14060601.737624915',
        poolSlipAverage: '0.3197441186194363',
        poolStakedTotal: '3682199542975',
        poolTxAverage: '58669549406.92824',
        poolUnits: '1689199469669',
        poolVolume: '21102028120401',
        poolVolume24hr: '21102028120401',
        price: '0.9999993321277123',
        runeDepth: '18446730538054964423',
        runeROI: '7453542.617293379',
        runeStakedTotal: '2637526147410',
        sellAssetCount: '32',
        sellFeeAverage: '2351879596.5625',
        sellFeesTotal: '75260147090',
        sellSlipAverage: '0.5309031250799308',
        sellTxAverage: '29269704210.093884',
        sellVolume: '18049129295453',
        stakeTxCount: '37',
        stakersCount: '22',
        stakingTxCount: '48',
        status: PoolDetailStatusEnum.Enabled,
        swappersCount: '1',
        swappingTxCount: '68',
        withdrawTxCount: '11'
      },
      {
        asset: 'BNB.LOK-3C0',
        assetDepth: '37424296744',
        assetROI: '0.328218990570089',
        assetStakedTotal: '28176300000',
        buyAssetCount: '9',
        buyFeeAverage: '208491058.14241052',
        buyFeesTotal: '1876419523',
        buySlipAverage: '0.2013888888888889',
        buyTxAverage: '1566610377.3971372',
        buyVolume: '14099493396',
        poolDepth: '48673495212',
        poolFeeAverage: '600993113.3846154',
        poolFeesTotal: '7812910474',
        poolROI: '0.1384894550884584',
        poolROI12: '0.1384894550884584',
        poolSlipAverage: '0.38851538801995605',
        poolStakedTotal: '43973955359',
        poolTxAverage: '2529481811.70531',
        poolUnits: '26913706341',
        poolVolume: '21541614020',
        poolVolume24hr: '21541614020',
        price: '0.6502927168538379',
        runeDepth: '24336747606',
        runeROI: '-0.05124008039317224',
        runeStakedTotal: '25651112682',
        sellAssetCount: '4',
        sellFeeAverage: '1484122737.75',
        sellFeesTotal: '5936490951',
        sellSlipAverage: '0.8095500110648572',
        sellTxAverage: '4695942538.898699',
        sellVolume: '7442120624',
        stakeTxCount: '6',
        stakersCount: '5',
        stakingTxCount: '6',
        status: PoolDetailStatusEnum.Enabled,
        swappersCount: '1',
        swappingTxCount: '13',
        withdrawTxCount: '0'
      },
      {
        asset: 'BNB.BOLT-E42',
        assetDepth: '18446743420523926728',
        assetROI: '151586055.02546698',
        assetStakedTotal: '122018650092',
        buyAssetCount: '9',
        buyFeeAverage: '0.6805646594055487',
        buyFeesTotal: '6',
        buySlipAverage: '0.04975555568105645',
        buyTxAverage: '700.5684392037332',
        buyVolume: '6305',
        poolDepth: '299879750322',
        poolFeeAverage: '0.6666666666666666',
        poolFeesTotal: '6',
        poolROI: '75793027.61991315',
        poolROI12: '75793027.61991315',
        poolSlipAverage: '0.04975555568105645',
        poolStakedTotal: '123915426389',
        poolTxAverage: '700.5684392037332',
        poolUnits: '122589177745',
        poolVolume: '6305',
        poolVolume24hr: '6305',
        price: '0.000000008128257207403678',
        runeDepth: '149939875161',
        runeROI: '0.21435932665378687',
        runeStakedTotal: '123915425398',
        sellAssetCount: '0',
        sellFeeAverage: '0',
        sellFeesTotal: '0',
        sellSlipAverage: '0',
        sellTxAverage: '0',
        sellVolume: '0',
        stakeTxCount: '7',
        stakersCount: '4',
        stakingTxCount: '8',
        status: PoolDetailStatusEnum.Bootstrapped,
        swappersCount: '1',
        swappingTxCount: '9',
        withdrawTxCount: '1'
      }
    ]

    const priceIndex: PriceDataIndex = {
      LOK: bn(0.6502927168538379),
      TOMOB: bn(0.9999993354396914),
      BOLT: bn(8.128257207403678e-9),
      RUNE: bn(1)
    }

    it('returns data for pending pools', () => {
      const result = getPoolViewData({ poolDetails, priceIndex } as PoolsState, PoolDetailStatusEnum.Bootstrapped)
      expect(result.length).toEqual(1)
      expect(result[0].pool.target).toEqual('BOLT')
    })

    it('returns data for available pools', () => {
      const result = getPoolViewData({ poolDetails, priceIndex } as PoolsState, PoolDetailStatusEnum.Enabled)
      expect(result.length).toEqual(2)
      expect(result[0].pool.target).toEqual('TOMOB')
      expect(result[1].pool.target).toEqual('LOK')
    })
  })
})
