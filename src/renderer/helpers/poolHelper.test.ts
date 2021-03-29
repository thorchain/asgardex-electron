import { PoolData } from '@thorchain/asgardex-util'
import { Balance } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, baseAmount, AssetRuneNative, AssetBNB } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { PoolDetails } from '../services/midgard/types'
import { toPoolData } from '../services/midgard/utils'
import { GetPoolsStatusEnum, PoolDetail } from '../types/generated/midgard'
import { getDeepestPool, getPoolPriceValue, getPoolTableRowsData } from './poolHelper'

describe('helpers/poolHelper/', () => {
  const mockPoolDetail: PoolDetail = {
    asset: assetToString(AssetBNB),
    assetDepth: '0',
    assetPrice: '0',
    assetPriceUSD: '0',
    poolAPY: '0',
    runeDepth: '0',
    status: GetPoolsStatusEnum.Staged,
    units: '0',
    volume24h: '0'
  }
  const pool1: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Staged, runeDepth: '1000' }
  const pool2: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Available, runeDepth: '2000' }
  const pool3: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Suspended, runeDepth: '0' }
  const pool4: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Staged, runeDepth: '4000' }

  describe('getDeepestPool', () => {
    it('returns deepest pool', () => {
      const pools = [pool1, pool2, pool4, pool3]
      const result = getDeepestPool(pools)
      expect(result).toEqual(O.some(pool4))
    })

    it('does not return a deepest pool by given an empty list of pools', () => {
      const pools: PoolDetails = []
      const result = getDeepestPool(pools)
      expect(result).toBeNone()
    })
  })

  describe('getPoolTableRowsData', () => {
    const poolDetails: PoolDetails = [
      { ...mockPoolDetail, asset: assetToString(ASSETS_TESTNET.TOMO), status: GetPoolsStatusEnum.Available },
      { ...mockPoolDetail, asset: assetToString(ASSETS_TESTNET.FTM), status: GetPoolsStatusEnum.Available }
    ]
    const pendingPoolDetails: PoolDetails = [
      { ...mockPoolDetail, asset: assetToString(ASSETS_TESTNET.BOLT), status: GetPoolsStatusEnum.Staged },
      { ...mockPoolDetail, asset: assetToString(ASSETS_TESTNET.FTM), status: GetPoolsStatusEnum.Staged }
    ]

    const pricePoolData: PoolData = {
      runeBalance: assetToBase(assetAmount(110)),
      assetBalance: assetToBase(assetAmount(100))
    }

    it('returns data for pending pools', () => {
      const result = getPoolTableRowsData({
        poolDetails: pendingPoolDetails,
        pricePoolData,
        network: 'testnet'
      })
      expect(result.length).toEqual(2)
      // Note: `getPoolTableRowsData` reverses the order of given `poolDetails`
      expect(result[0].pool.asset).toEqual(AssetRuneNative)
      expect(result[0].pool.target).toEqual(ASSETS_TESTNET.FTM)
      expect(result[1].pool.asset).toEqual(AssetRuneNative)
      expect(result[1].pool.target).toEqual(ASSETS_TESTNET.BOLT)
    })

    it('returns data for available pools', () => {
      const result = getPoolTableRowsData({
        poolDetails,
        pricePoolData,
        network: 'testnet'
      })
      expect(result.length).toEqual(2)
      // Note: `getPoolTableRowsData` reverses the order of given `poolDetails`
      expect(result[0].pool.asset).toEqual(AssetRuneNative)
      expect(result[0].pool.target).toEqual(ASSETS_TESTNET.FTM)
      expect(result[1].pool.asset).toEqual(AssetRuneNative)
      expect(result[1].pool.target).toEqual(ASSETS_TESTNET.TOMO)
    })
  })

  describe('toPoolData', () => {
    const poolDetail: PoolDetail = {
      ...mockPoolDetail,
      assetDepth: '11000000000',
      runeDepth: '10000000000'
    }

    it('transforms `PoolData', () => {
      const result = toPoolData(poolDetail)
      expect(result.assetBalance.amount().toNumber()).toEqual(11000000000)
      expect(result.runeBalance.amount().toNumber()).toEqual(10000000000)
    })
  })

  describe('getPoolPriceValue', () => {
    const poolDetails: PoolDetails = [
      {
        ...mockPoolDetail,
        asset: assetToString(AssetBNB),
        assetDepth: '1000000000',
        runeDepth: '10000000000'
      }
    ]
    const usdPool: PoolData = {
      assetBalance: assetToBase(assetAmount(110000)),
      runeBalance: assetToBase(assetAmount(100000))
    }

    it('returns a price for BNB in USD', () => {
      const balance: Balance = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      const result = FP.pipe(
        getPoolPriceValue(balance, poolDetails, usdPool),
        O.fold(
          () => 'failure',
          (price) => price.amount().toString()
        )
      )
      expect(result).toEqual('11')
    })

    it('returns a price for RUNE in USD', () => {
      const balance: Balance = {
        amount: baseAmount('1'),
        asset: AssetRuneNative
      }
      const result = FP.pipe(
        getPoolPriceValue(balance, [], usdPool),
        O.fold(
          () => 'failure',
          (price) => price.amount().toString()
        )
      )
      expect(result).toEqual('1')
    })

    it('returns a no price if no pools are available', () => {
      const balance: Balance = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      const result = getPoolPriceValue(balance, [], usdPool)
      expect(result).toBeNone()
    })
  })
})
