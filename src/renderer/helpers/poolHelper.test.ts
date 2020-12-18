import { PoolData } from '@thorchain/asgardex-util'
import { assetAmount, assetToBase, AssetRune67C, assetToString } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { PoolDetails, PoolDetail } from '../services/midgard/types'
import { toPoolData } from '../services/midgard/utils'
import { GetPoolsStatusEnum } from '../types/generated/midgard'
import { getDeepestPool, getPoolTableRowsData } from './poolHelper'

describe('helpers/poolHelper/', () => {
  const pool1 = { status: GetPoolsStatusEnum.Staged, runeDepth: '1000' } as PoolDetail
  const pool2 = { status: GetPoolsStatusEnum.Available, runeDepth: '2000' } as PoolDetail
  const pool3 = { status: GetPoolsStatusEnum.Suspended, runeDepth: '0' } as PoolDetail
  const pool4 = { status: GetPoolsStatusEnum.Staged, runeDepth: '4000' } as PoolDetail

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
    const poolDetails = [
      {
        asset: assetToString(ASSETS_TESTNET.TOMO),
        status: GetPoolsStatusEnum.Available
      },
      {
        asset: assetToString(ASSETS_TESTNET.FTM),
        status: GetPoolsStatusEnum.Available
      }
    ] as PoolDetails
    const pendingPoolDetails = [
      {
        asset: assetToString(ASSETS_TESTNET.BOLT),
        status: GetPoolsStatusEnum.Staged
      },
      {
        asset: assetToString(ASSETS_TESTNET.FTM),
        status: GetPoolsStatusEnum.Staged
      }
    ] as PoolDetails

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
      expect(result[0].pool.asset).toEqual(AssetRune67C)
      expect(result[0].pool.target).toEqual(ASSETS_TESTNET.FTM)
      expect(result[1].pool.asset).toEqual(AssetRune67C)
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
      expect(result[0].pool.asset).toEqual(AssetRune67C)
      expect(result[0].pool.target).toEqual(ASSETS_TESTNET.FTM)
      expect(result[1].pool.asset).toEqual(AssetRune67C)
      expect(result[1].pool.target).toEqual(ASSETS_TESTNET.TOMO)
    })
  })

  describe('toPoolData', () => {
    const poolDetail = {
      assetDepth: '11000000000',
      runeDepth: '10000000000'
    } as PoolDetail

    it('transforms `PoolData', () => {
      const result = toPoolData(poolDetail)
      expect(result.assetBalance.amount().toNumber()).toEqual(11000000000)
      expect(result.runeBalance.amount().toNumber()).toEqual(10000000000)
    })
  })
})
