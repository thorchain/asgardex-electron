import { PoolData } from '@thorchain/asgardex-util'
import { bn, assetAmount, assetToBase, AssetRune67C, BNBChain, AssetBNB } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { ThorchainLastblock, PoolDetail } from '../../services/midgard/types'
import { Constants as ThorchainConstants } from '../../types/generated/midgard'
import { GetPoolsStatusEnum } from '../../types/generated/midgard'
import { PoolTableRowData } from './Pools.types'
import { getPoolTableRowData, getBlocksLeftForPendingPool, getBlocksLeftForPendingPoolAsString } from './Pools.utils'

describe('views/pools/utils', () => {
  describe('getPoolTableRowData', () => {
    const lokPoolDetail = {
      asset: 'BNB.FTM-585',
      assetDepth: '11000000000',
      runeDepth: '10000000000',
      volume24h: '10000000000',
      // poolTxAverage: '10000000000',
      poolSlipAverage: '0.0011',
      swappingTxCount: '123',
      status: GetPoolsStatusEnum.Staged
    } as PoolDetail

    const pricePoolData: PoolData = {
      runeBalance: assetToBase(assetAmount(10)),
      assetBalance: assetToBase(assetAmount(100))
    }

    it('transforms data for a FTM pool', () => {
      const expected: PoolTableRowData = {
        pool: {
          asset: AssetRune67C,
          target: ASSETS_TESTNET.FTM
        },
        poolPrice: assetToBase(assetAmount(2)),
        depthPrice: assetToBase(assetAmount(1000)),
        volumePrice: assetToBase(assetAmount(1000)),
        transactionPrice: assetToBase(assetAmount(1000)),
        slip: bn('0.11'),
        trades: bn(123),
        status: GetPoolsStatusEnum.Available,
        deepest: false,
        key: 'hi'
      }

      const result = getPoolTableRowData({
        poolDetail: lokPoolDetail,
        pricePoolData: pricePoolData,
        network: 'testnet'
      })

      expect(O.isSome(result)).toBeTruthy()
      FP.pipe(
        result,
        O.map((data) => {
          expect(data.pool).toEqual(expected.pool)
          expect(data.pool).toEqual(expected.pool)
          expect(data.depthPrice.amount().toNumber()).toEqual(expected.depthPrice.amount().toNumber())
          expect(data.volumePrice.amount().toNumber()).toEqual(expected.volumePrice.amount().toNumber())
          /**
           * Mock it with fixed 0 as midgard v2 does not have data for poolDetail?.poolTxAverage
           * target result: expected.transactionPrice.amount().toNumber()
           */
          expect(data.transactionPrice.amount().toNumber()).toEqual(0)
          expect(data.slip.toNumber()).toEqual(expected.slip.toNumber())
          expect(data.trades.toNumber()).toEqual(expected.trades.toNumber())
          return true
        })
      )
    })
  })

  describe('getBlocksLeftForPendingPool', () => {
    const constants = {
      int_64_values: { NewPoolCycle: 3001 }
    } as ThorchainConstants
    const lastblock = [
      {
        thorchain: '2000',
        chain: BNBChain
      }
    ] as ThorchainLastblock
    it('returns number of blocks left', () => {
      const result = O.toNullable(getBlocksLeftForPendingPool(constants, lastblock, AssetBNB))
      expect(result).toEqual(1001)
    })
    it('returns None if NewPoolCycle is not available', () => {
      const constants2 = {
        int_64_values: {}
      } as ThorchainConstants
      const result = getBlocksLeftForPendingPool(constants2, lastblock, AssetBNB)
      expect(result).toBeNone()
    })
    it('returns NOne if lastblock (thorchain) is not available', () => {
      const lastblock2: ThorchainLastblock = []
      const result = getBlocksLeftForPendingPool(constants, lastblock2, AssetBNB)
      expect(result).toBeNone()
    })
  })

  describe('getBlocksLeftForPendingPoolAsString', () => {
    const constants = {
      int_64_values: { NewPoolCycle: 1234 }
    } as ThorchainConstants
    const lastblock = [
      {
        thorchain: '1000',
        chain: BNBChain
      }
    ] as ThorchainLastblock
    it('returns number of blocks left', () => {
      const result = getBlocksLeftForPendingPoolAsString(constants, lastblock, AssetBNB)
      expect(result).toEqual('234')
    })
    it('returns empty string if NewPoolCycle is not available', () => {
      const constants2 = {
        int_64_values: {}
      } as ThorchainConstants
      const result = getBlocksLeftForPendingPoolAsString(constants2, lastblock, AssetBNB)
      expect(result).toEqual('')
    })
    it('returns empty string if lastblock (thorchain) is not available', () => {
      const lastblock2: ThorchainLastblock = []
      const result = getBlocksLeftForPendingPoolAsString(constants, lastblock2, AssetBNB)
      expect(result).toEqual('')
    })
  })
})
