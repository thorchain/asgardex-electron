import { PoolData, assetAmount, assetToBase } from '@thorchain/asgardex-util'
import { some } from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { PoolDetails } from '../services/midgard/types'
import { toPoolData } from '../services/midgard/utils'
import { PoolDetailStatusEnum, PoolDetail } from '../types/generated/midgard'
import { filterPendingPools, getDeepestPool, getPoolTableRowsData } from './poolHelper'

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
      expect(result).toEqual(some(pool4))
    })

    it('does not return a deepest pool by given an empty list of pools', () => {
      const pools: PoolDetails = []
      const result = getDeepestPool(pools)
      expect(result).toBeNone()
    })
  })

  describe('getPoolViewData', () => {
    const poolDetails: PoolDetails = [
      {
        asset: 'BNB.TOMOB-1E1',
        status: PoolDetailStatusEnum.Enabled
      },
      {
        asset: 'BNB.FTM-585',
        status: PoolDetailStatusEnum.Enabled
      },
      {
        asset: 'BNB.BOLT-E42',
        status: PoolDetailStatusEnum.Bootstrapped
      }
    ]

    const pricePoolData: PoolData = {
      runeBalance: assetToBase(assetAmount(110)),
      assetBalance: assetToBase(assetAmount(100))
    }

    it('returns data for pending pools', () => {
      const result = getPoolTableRowsData(poolDetails, pricePoolData, PoolDetailStatusEnum.Bootstrapped)
      expect(result.length).toEqual(1)
      expect(result[0].pool.target).toEqual(ASSETS_TESTNET.BOLT)
    })

    it('returns data for available pools', () => {
      const result = getPoolTableRowsData(poolDetails, pricePoolData, PoolDetailStatusEnum.Enabled)
      expect(result.length).toEqual(2)
      expect(result[0].pool.target).toEqual(ASSETS_TESTNET.TOMO)
      expect(result[1].pool.target).toEqual(ASSETS_TESTNET.FTM)
    })
  })

  describe('getPoolViewData', () => {
    const poolDetail: PoolDetail = {
      assetDepth: '11000000000',
      runeDepth: '10000000000'
    }

    it('transforms `PoolData', () => {
      const result = toPoolData(poolDetail)
      expect(result.assetBalance.amount().toNumber()).toEqual(11000000000)
      expect(result.runeBalance.amount().toNumber()).toEqual(10000000000)
    })
  })
})
