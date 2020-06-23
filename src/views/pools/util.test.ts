// import { baseAmount } from '@thorchain/asgardex-token'
import { bn, assetAmount, PoolData, assetToBase } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ThorchainConstants, ThorchainLastblock } from '../../types/generated/midgard'
import { PoolDetail, PoolDetailStatusEnum } from '../../types/generated/midgard/models/PoolDetail'
import { PoolTableRowData } from './types'
import { getPoolTableRowData, getBlocksLeftForPendingPool, getBlocksLeftForPendingPoolAsString } from './utils'

describe('poolUtil', () => {
  describe('getPoolTableRowData', () => {
    const lokPoolDetail: PoolDetail = {
      asset: 'BNB.LOK-3C0',
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

    it('transforms data for a LOK pool', () => {
      const expected: PoolTableRowData = {
        pool: {
          asset: 'RUNE',
          target: 'LOK'
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

      const result = getPoolTableRowData(lokPoolDetail, pricePoolData)

      expect(result.pool.asset).toEqual(expected.pool.asset)
      expect(result.pool.target).toEqual(expected.pool.target)
      expect(result.depthPrice.amount().toNumber()).toEqual(expected.depthPrice.amount().toNumber())
      expect(result.volumePrice.amount().toNumber()).toEqual(expected.volumePrice.amount().toNumber())
      expect(result.transactionPrice.amount().toNumber()).toEqual(expected.transactionPrice.amount().toNumber())
      expect(result.slip.toNumber()).toEqual(expected.slip.toNumber())
      expect(result.trades.toNumber()).toEqual(expected.trades.toNumber())
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
