import { PoolData } from '@thorchain/asgardex-util'
import {
  assetAmount,
  assetToBase,
  BNBChain,
  AssetBNB,
  AssetRuneNative,
  AssetETH,
  AssetLTC,
  AssetBTC,
  AssetBCH,
  ETHChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET, ERC20_TESTNET } from '../../../shared/mock/assets'
import { AssetUSDTERC20 } from '../../const'
import { eqBaseAmount } from '../../helpers/fp/eq'
import { LastblockItems } from '../../services/midgard/types'
import { Constants as ThorchainConstants, PoolDetail } from '../../types/generated/midgard'
import { GetPoolsStatusEnum } from '../../types/generated/midgard'
import { PoolTableRowData } from './Pools.types'
import {
  getPoolTableRowData,
  getBlocksLeftForPendingPool,
  getBlocksLeftForPendingPoolAsString,
  filterTableData,
  minPoolTxAmountUSD
} from './Pools.utils'

describe('views/pools/utils', () => {
  describe('getPoolTableRowData', () => {
    const lokPoolDetail = {
      asset: 'BNB.FTM-585',
      assetDepth: '11000000000',
      runeDepth: '10000000000',
      volume24h: '10000000000',
      status: GetPoolsStatusEnum.Staged
    } as PoolDetail

    const pricePoolData: PoolData = {
      runeBalance: assetToBase(assetAmount(10)),
      assetBalance: assetToBase(assetAmount(100))
    }

    it('transforms data for a FTM pool', () => {
      const expected: PoolTableRowData = {
        pool: {
          asset: AssetRuneNative,
          target: ASSETS_TESTNET.FTM
        },
        poolPrice: assetToBase(assetAmount(2)),
        depthPrice: assetToBase(assetAmount(1000)),
        volumePrice: assetToBase(assetAmount(1000)),
        transactionPrice: assetToBase(assetAmount(1000)),
        status: GetPoolsStatusEnum.Available,
        deepest: false,
        key: 'hi',
        network: 'testnet'
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
          expect(data.transactionPrice.amount().toNumber()).toEqual(0)
          return true
        })
      )
    })
  })

  describe('getBlocksLeftForPendingPool', () => {
    const constants = {
      int_64_values: { PoolCycle: 3001 }
    } as ThorchainConstants
    const lastblock = [
      {
        thorchain: '2000',
        chain: BNBChain
      }
    ] as LastblockItems
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
      const lastblock2: LastblockItems = []
      const result = getBlocksLeftForPendingPool(constants, lastblock2, AssetBNB)
      expect(result).toBeNone()
    })
  })

  describe('getBlocksLeftForPendingPoolAsString', () => {
    const constants = {
      int_64_values: { PoolCycle: 1234 }
    } as ThorchainConstants
    const lastblock = [
      {
        thorchain: '1000',
        chain: BNBChain
      }
    ] as LastblockItems
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
      const lastblock2: LastblockItems = []
      const result = getBlocksLeftForPendingPoolAsString(constants, lastblock2, AssetBNB)
      expect(result).toEqual('')
    })
  })
})

describe('filterTableData', () => {
  const tableData = [
    {
      pool: {
        asset: AssetRuneNative,
        target: AssetBNB
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: AssetLTC
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: AssetBTC
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: AssetBCH
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: ASSETS_TESTNET.BUSD
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: ERC20_TESTNET.USDT
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: ERC20_TESTNET.RUNE
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: ERC20_TESTNET.USDT
      }
    },
    {
      pool: {
        asset: AssetRuneNative,
        target: AssetETH
      }
    }
  ] as PoolTableRowData[]

  it('should not filter anything', () => {
    expect(filterTableData()(tableData)).toEqual(tableData)
    expect(filterTableData(O.none)(tableData)).toEqual(tableData)
  })

  it('should return only chain-based pools', () => {
    expect(filterTableData(O.some('base'))(tableData)).toEqual([
      tableData[0],
      tableData[1],
      tableData[2],
      tableData[3],
      tableData[8]
    ])
  })

  it('should return BNB assets', () => {
    expect(filterTableData(O.some(BNBChain))(tableData)).toEqual([tableData[0], tableData[4]])
  })

  it('should return ETH assets', () => {
    expect(filterTableData(O.some(ETHChain))(tableData)).toEqual([
      tableData[5],
      tableData[6],
      tableData[7],
      tableData[8]
    ])
  })

  it('should return USD assets', () => {
    expect(filterTableData(O.some('usd'))(tableData)).toEqual([tableData[4], tableData[5], tableData[7]])
  })
})

describe.only('minPoolTxAmount', () => {
  it('$200 for BTC', () => {
    const result = minPoolTxAmountUSD(AssetBTC)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(200, 8)))).toBeTruthy()
  })
  it('$50 for ETH', () => {
    const result = minPoolTxAmountUSD(AssetETH)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(50, 8)))).toBeTruthy()
  })
  it('$100 for ERC20', () => {
    const result = minPoolTxAmountUSD(AssetUSDTERC20)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(100, 8)))).toBeTruthy()
  })
  it('$10 for others (BNB)', () => {
    const result = minPoolTxAmountUSD(AssetBNB)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(10, 8)))).toBeTruthy()
  })
  it('$10 for others (LTC)', () => {
    const result = minPoolTxAmountUSD(AssetLTC)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(10, 8)))).toBeTruthy()
  })
  it('$10 for others (BCH)', () => {
    const result = minPoolTxAmountUSD(AssetBCH)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(10, 8)))).toBeTruthy()
  })
  it('$10 for others (RUNE)', () => {
    const result = minPoolTxAmountUSD(AssetRuneNative)
    expect(eqBaseAmount.equals(result, assetToBase(assetAmount(10, 8)))).toBeTruthy()
  })
})
