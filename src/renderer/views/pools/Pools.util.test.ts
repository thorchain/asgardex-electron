import { PoolData } from '@thorchain/asgardex-util'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_TESTNET, ERC20_TESTNET } from '../../../shared/mock/assets'
import { AssetBCH, AssetBNB, AssetBTC, AssetETH, AssetLTC, AssetRuneNative } from '../../../shared/utils/asset'
import { BNBChain } from '../../../shared/utils/chain'
import { AssetUSDTERC20Testnet } from '../../const'
import { eqBaseAmount } from '../../helpers/fp/eq'
import { LastblockItems } from '../../services/thorchain/types'
import { PoolDetail } from '../../types/generated/midgard'
import { GetPoolsStatusEnum } from '../../types/generated/midgard'
import { PoolTableRowData } from './Pools.types'
import {
  getPoolTableRowData,
  getBlocksLeftForPendingPool,
  getBlocksLeftForPendingPoolAsString,
  filterTableData,
  minPoolTxAmountUSD,
  stringToGetPoolsStatus,
  isEmptyPool,
  FilterTableData
} from './Pools.utils'

describe('views/pools/utils', () => {
  describe('getPoolTableRowData', () => {
    const lokPoolDetail = {
      asset: 'BNB.FTM-585',
      assetDepth: '11000000000',
      runeDepth: '10000000000',
      volume24h: '10000000000',
      poolAPY: '0.02',
      status: GetPoolsStatusEnum.Staged
    } as PoolDetail

    const pricePoolData: PoolData = {
      runeBalance: assetToBase(assetAmount(10)),
      assetBalance: assetToBase(assetAmount(100))
    }

    it('transforms data for a FTM pool', () => {
      const expected: PoolTableRowData = {
        asset: ASSETS_TESTNET.FTM,
        poolPrice: assetToBase(assetAmount(2)),
        depthAmount: assetToBase(assetAmount(220)),
        depthPrice: assetToBase(assetAmount(2000)),
        volumeAmount: assetToBase(assetAmount(110)),
        volumePrice: assetToBase(assetAmount(1000)),
        status: GetPoolsStatusEnum.Available,
        deepest: false,
        apy: 2,
        key: 'hi',
        network: 'testnet',
        watched: false
      }

      const result = getPoolTableRowData({
        poolDetail: lokPoolDetail,
        pricePoolData: pricePoolData,
        watchlist: [],
        network: 'testnet'
      })

      expect(O.isSome(result)).toBeTruthy()
      FP.pipe(
        result,
        O.map((data) => {
          expect(data.asset).toEqual(expected.asset)
          expect(data.asset).toEqual(expected.asset)
          expect(data.depthPrice.eq(expected.depthPrice)).toBeTruthy()
          expect(data.depthAmount.eq(expected.depthAmount)).toBeTruthy()
          expect(data.volumePrice.eq(expected.volumePrice)).toBeTruthy()
          expect(data.volumeAmount.eq(expected.volumeAmount)).toBeTruthy()
          expect(data.apy).toEqual(expected.apy)
          return true
        })
      )
    })
  })

  describe('getBlocksLeftForPendingPool', () => {
    const oNewPoolCycle = O.some(3001)
    const lastblock = [
      {
        thorchain: 2000,
        chain: BNBChain
      }
    ]
    it('returns number of blocks left', () => {
      const result = O.toNullable(getBlocksLeftForPendingPool(lastblock, AssetBNB, oNewPoolCycle))
      expect(result).toEqual(1001)
    })
    it('returns None if NewPoolCycle is not available', () => {
      const result = getBlocksLeftForPendingPool(lastblock, AssetBNB, O.none)
      expect(result).toBeNone()
    })
    it('returns NOne if lastblock (thorchain) is not available', () => {
      const lastblock2: LastblockItems = []
      const result = getBlocksLeftForPendingPool(lastblock2, AssetBNB, oNewPoolCycle)
      expect(result).toBeNone()
    })
  })

  describe('getBlocksLeftForPendingPoolAsString', () => {
    const oNewPoolCycle = O.some(1234)
    const lastblock = [
      {
        thorchain: 1000,
        chain: BNBChain
      }
    ]
    it('returns number of blocks left', () => {
      const result = getBlocksLeftForPendingPoolAsString(lastblock, AssetBNB, oNewPoolCycle)
      expect(result).toEqual('234')
    })
    it('returns empty string if NewPoolCycle is not available', () => {
      const result = getBlocksLeftForPendingPoolAsString(lastblock, AssetBNB, O.none)
      expect(result).toEqual('')
    })
    it('returns empty string if lastblock (thorchain) is not available', () => {
      const lastblock2: LastblockItems = []
      const result = getBlocksLeftForPendingPoolAsString(lastblock2, AssetBNB, oNewPoolCycle)
      expect(result).toEqual('')
    })
  })

  describe('filterTableData', () => {
    const tableData: FilterTableData[] = [
      {
        asset: AssetBNB
      },
      {
        asset: AssetLTC
      },
      {
        asset: AssetBTC
      },
      {
        asset: AssetBCH
      },
      {
        asset: ASSETS_TESTNET.BUSD
      },
      {
        asset: ERC20_TESTNET.USDT
      },
      {
        asset: ERC20_TESTNET.RUNE
      },
      {
        asset: ERC20_TESTNET.USDT
      },
      {
        asset: AssetETH
      },
      {
        asset: { chain: BNBChain, symbol: 'BNB.ETH-1C9', ticker: 'ETH', synth: false }
      }
    ] as PoolTableRowData[]

    it('should not filter anything', () => {
      expect(filterTableData()(tableData)).toEqual(tableData)
      expect(filterTableData(O.none)(tableData)).toEqual(tableData)
    })

    it('base', () => {
      expect(filterTableData(O.some('__base__'))(tableData)).toEqual([
        tableData[0],
        tableData[1],
        tableData[2],
        tableData[3],
        tableData[8]
      ])
    })

    it('bep2', () => {
      const result = filterTableData(O.some('__bep2__'))(tableData)
      expect(result).toEqual([tableData[4], tableData[9]])
    })

    it('erc20', () => {
      const result = filterTableData(O.some('__erc20__'))(tableData)
      expect(result).toEqual([tableData[5], tableData[6], tableData[7]])
    })

    it('usd', () => {
      expect(filterTableData(O.some('__usd__'))(tableData)).toEqual([tableData[4], tableData[5], tableData[7]])
    })
  })

  describe('minPoolTxAmount', () => {
    it('$200 for BTC', () => {
      const result = minPoolTxAmountUSD(AssetBTC)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(200, 8)))).toBeTruthy()
    })
    it('$50 for ETH', () => {
      const result = minPoolTxAmountUSD(AssetETH)
      expect(eqBaseAmount.equals(result, assetToBase(assetAmount(50, 8)))).toBeTruthy()
    })
    it('$100 for ERC20', () => {
      const result = minPoolTxAmountUSD(AssetUSDTERC20Testnet)
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

  describe('stringToGetPoolsStatus', () => {
    it('suspended', () => {
      const status = 'suspended'
      const result = stringToGetPoolsStatus(status)
      expect(result).toEqual(GetPoolsStatusEnum.Suspended)
    })

    it('available', () => {
      const status = 'available'
      const result = stringToGetPoolsStatus(status)
      expect(result).toEqual(GetPoolsStatusEnum.Available)
    })

    it('staged', () => {
      const status = 'staged'
      const result = stringToGetPoolsStatus(status)
      expect(result).toEqual(GetPoolsStatusEnum.Staged)
    })

    it('suspended for others', () => {
      const status = 'other'
      const result = stringToGetPoolsStatus(status)
      expect(result).toEqual(GetPoolsStatusEnum.Suspended)
    })
  })

  describe('isEmptyPool', () => {
    it('empty if assetDepth and runeDepth are zero', () => {
      expect(isEmptyPool({ assetDepth: '0', runeDepth: '0' })).toBeTruthy()
    })
    it('empty if assetDepth is zero', () => {
      expect(isEmptyPool({ assetDepth: '0', runeDepth: '100' })).toBeTruthy()
    })
    it('empty if runeDepth is zero', () => {
      expect(isEmptyPool({ assetDepth: '100', runeDepth: '0' })).toBeTruthy()
    })
    it('not empty if assetDepth and runeDepth are NOT zero', () => {
      expect(isEmptyPool({ assetDepth: '100', runeDepth: '200' })).toBeFalsy()
    })
  })
})
