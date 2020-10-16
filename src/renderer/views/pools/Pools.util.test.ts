import { bn, assetAmount, PoolData, assetToBase, AssetRune67C } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { ThorchainConstants, ThorchainLastblock } from '../../types/generated/midgard'
import { PoolDetail, PoolDetailStatusEnum } from '../../types/generated/midgard/models/PoolDetail'
import { PoolTableRowData } from './Pools.types'
import { getPoolTableRowData, getBlocksLeftForPendingPool, getBlocksLeftForPendingPoolAsString } from './Pools.utils'

describe('views/pools/utils', () => {
  describe('getPoolTableRowData', () => {
    const lokPoolDetail: PoolDetail = {
      asset: 'BNB.FTM-585',
      assetDepth: '11000000000',
      runeDepth: '10000000000',
      poolVolume24hr: '10000000000',
      poolTxAverage: '10000000000',
      poolSlipAverage: '0.0011',
      swappingTxCount: '123',
      status: PoolDetailStatusEnum.Bootstrapped
    }

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
        status: PoolDetailStatusEnum.Enabled,
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
          expect(data.transactionPrice.amount().toNumber()).toEqual(expected.transactionPrice.amount().toNumber())
          expect(data.slip.toNumber()).toEqual(expected.slip.toNumber())
          expect(data.trades.toNumber()).toEqual(expected.trades.toNumber())
          return true
        })
      )
    })
  })

  describe('getBlocksLeftForPendingPool', () => {
    const constants: ThorchainConstants = {
      int_64_values: { NewPoolCycle: 3001 }
    }
    const lastblock: ThorchainLastblock = {
      thorchain: 2000
    }
    it('returns number of blocks left', () => {
      const result = O.toNullable(getBlocksLeftForPendingPool(constants, lastblock))
      expect(result).toEqual(1001)
    })
    it('returns None if NewPoolCycle is not available', () => {
      const constants2: ThorchainConstants = {
        int_64_values: {}
      }
      const result = getBlocksLeftForPendingPool(constants2, lastblock)
      expect(result).toBeNone()
    })
    it('returns NOne if lastblock (thorchain) is not available', () => {
      const lastblock2: ThorchainLastblock = {}
      const result = getBlocksLeftForPendingPool(constants, lastblock2)
      expect(result).toBeNone()
    })
  })

  describe('getBlocksLeftForPendingPoolAsString', () => {
    const constants: ThorchainConstants = {
      int_64_values: { NewPoolCycle: 1234 }
    }
    const lastblock: ThorchainLastblock = {
      thorchain: 1000
    }
    it('returns number of blocks left', () => {
      const result = getBlocksLeftForPendingPoolAsString(constants, lastblock)
      expect(result).toEqual('234')
    })
    it('returns empty string if NewPoolCycle is not available', () => {
      const constants2: ThorchainConstants = {
        int_64_values: {}
      }
      const result = getBlocksLeftForPendingPoolAsString(constants2, lastblock)
      expect(result).toEqual('')
    })
    it('returns empty string if lastblock (thorchain) is not available', () => {
      const lastblock2: ThorchainLastblock = {}
      const result = getBlocksLeftForPendingPoolAsString(constants, lastblock2)
      expect(result).toEqual('')
    })
  })
})
