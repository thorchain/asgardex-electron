import { PoolData } from '@thorchain/asgardex-util'
import { Balance } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, baseAmount, AssetRuneNative, AssetBNB } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { PoolsWatchList } from '../../shared/api/io'
import { ASSETS_TESTNET } from '../../shared/mock/assets'
import { BCHChain, BNBChain, BTCChain, CosmosChain, DOGEChain, ETHChain, LTCChain } from '../../shared/utils/chain'
import { AssetBUSD74E } from '../const'
import { PoolDetails } from '../services/midgard/types'
import { toPoolData } from '../services/midgard/utils'
import { DEFAULT_MIMIR_HALT } from '../services/thorchain/const'
import { GetPoolsStatusEnum, PoolDetail } from '../types/generated/midgard'
import { PricePool } from '../views/pools/Pools.types'
import {
  disableAllActions,
  disablePoolActions,
  disableTradingActions,
  getDeepestPool,
  getPoolPriceValue,
  getPoolTableRowsData
} from './poolHelper'

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
    volume24h: '0',
    liquidityUnits: '0',
    synthUnits: '0',
    synthSupply: '0',
    annualPercentageRate: '0',
    nativeDecimal: '0',
    saversDepth: '0',
    saversUnits: '0',
    saversAPR: '0'
  }
  const pool1: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Staged, runeDepth: '1000' }
  const pool2: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Available, runeDepth: '2000' }
  const pool3: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Suspended, runeDepth: '0' }
  const pool4: PoolDetail = { ...mockPoolDetail, status: GetPoolsStatusEnum.Staged, runeDepth: '4000' }

  const watchlist: PoolsWatchList = [AssetBNB]

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
        watchlist,
        network: 'testnet'
      })
      expect(result.length).toEqual(2)
      // Note: `getPoolTableRowsData` reverses the order of given `poolDetails`
      expect(result[0].asset).toEqual(ASSETS_TESTNET.FTM)
      expect(result[1].asset).toEqual(ASSETS_TESTNET.BOLT)
    })

    it('returns data for available pools', () => {
      const result = getPoolTableRowsData({
        poolDetails,
        pricePoolData,
        watchlist,
        network: 'testnet'
      })
      expect(result.length).toEqual(2)
      // Note: `getPoolTableRowsData` reverses the order of given `poolDetails`
      expect(result[0].asset).toEqual(ASSETS_TESTNET.FTM)
      expect(result[1].asset).toEqual(ASSETS_TESTNET.TOMO)
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

    const usdPricePool: PricePool = {
      asset: AssetBUSD74E,
      poolData: {
        assetBalance: assetToBase(assetAmount(110000)),
        runeBalance: assetToBase(assetAmount(100000))
      }
    }

    it('returns a price for BNB in USD', () => {
      const balance: Balance = {
        amount: baseAmount('1'),
        asset: AssetBNB
      }
      const result = FP.pipe(
        getPoolPriceValue({ balance, poolDetails, pricePool: usdPricePool, network: 'testnet' }),
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
        getPoolPriceValue({ balance, poolDetails: [], pricePool: usdPricePool, network: 'testnet' }),
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
      const result = getPoolPriceValue({ balance, poolDetails: [], pricePool: usdPricePool, network: 'testnet' })
      expect(result).toBeNone()
    })
  })

  describe('disableAllActions', () => {
    const haltedChains = [ETHChain, BNBChain]
    it('true for any chain if THORChain is halted', () => {
      const result = disableAllActions({
        chain: BNBChain,
        haltedChains,
        mimirHalt: { ...DEFAULT_MIMIR_HALT, haltThorChain: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if chain is not in halted list, but THORChain is halted', () => {
      const result = disableAllActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: { ...DEFAULT_MIMIR_HALT, haltThorChain: true }
      })
      expect(result).toBeTruthy()
    })
    it('true for ETH if ETH chain is halted', () => {
      const result = disableAllActions({
        chain: ETHChain,
        haltedChains,
        mimirHalt: { ...DEFAULT_MIMIR_HALT, haltEthChain: true }
      })
      expect(result).toBeTruthy()
    })
    it('false for a chain, if it is not in halted list, but ETH chain is halted', () => {
      const result = disableAllActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: { ...DEFAULT_MIMIR_HALT, haltEthChain: true }
      })
      expect(result).toBeFalsy()
    })
    it('true if ETH is in halted list, but no mimir halt', () => {
      const result = disableAllActions({
        chain: ETHChain,
        haltedChains,
        mimirHalt: DEFAULT_MIMIR_HALT
      })
      expect(result).toBeTruthy()
    })
    it('true if BNB is in halted list, but no mimir halt', () => {
      const result = disableAllActions({
        chain: BNBChain,
        haltedChains,
        mimirHalt: DEFAULT_MIMIR_HALT
      })
      expect(result).toBeTruthy()
    })
    it('false if no mimir halt + chain is not in halted list', () => {
      const result = disableAllActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: DEFAULT_MIMIR_HALT
      })
      expect(result).toBeFalsy()
    })
  })

  describe('disableTradingActions', () => {
    const haltedChains = [ETHChain, BNBChain]
    it('true for any chain if trading is halted', () => {
      const result = disableTradingActions({
        chain: BNBChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('true if chain is not in halted list, but trading is halted', () => {
      const result = disableTradingActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('true for BTC if BTC trading is halted', () => {
      const result = disableTradingActions({
        chain: BTCChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltBtcTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('true for ETH if ETH trading is halted', () => {
      const result = disableTradingActions({
        chain: ETHChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltEthTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('true for BCH if BCH trading is halted', () => {
      const result = disableTradingActions({
        chain: BCHChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltBchTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('true for LTC if LTC trading is halted', () => {
      const result = disableTradingActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltLtcTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('true for DOGE if DOGE trading is halted', () => {
      const result = disableTradingActions({
        chain: DOGEChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltDogeTrading: true
        }
      })
      expect(result).toBeTruthy()
    })

    it('true for BNB if BNB trading is halted', () => {
      const result = disableTradingActions({
        chain: BNBChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltBnbTrading: true
        }
      })
      expect(result).toBeTruthy()
    })

    it('true for Cosmos if Cosmos trading is halted', () => {
      const result = disableTradingActions({
        chain: CosmosChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltCosmosTrading: true
        }
      })
      expect(result).toBeTruthy()
    })
    it('false for a chain, if it is not in halted list, but other chains have trading halted', () => {
      const result = disableTradingActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltBtcTrading: true,
          haltEthTrading: true,
          haltBchTrading: true,
          haltBnbTrading: true,
          haltCosmosTrading: true
        }
      })
      expect(result).toBeFalsy()
    })
    it('true if ETH is in halted list, but no mimir trading halt', () => {
      const result = disableTradingActions({
        chain: ETHChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT
        }
      })
      expect(result).toBeTruthy()
    })
    it('true if BNB is in halted list, but no mimir trading halt', () => {
      const result = disableTradingActions({
        chain: BNBChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT
        }
      })
      expect(result).toBeTruthy()
    })
    it('false if no mimir trading halt + chain is not in halted list', () => {
      const result = disableTradingActions({
        chain: LTCChain,
        haltedChains,
        mimirHalt: {
          ...DEFAULT_MIMIR_HALT,
          haltEthTrading: true
        }
      })
      expect(result).toBeFalsy()
    })
  })

  describe('disablePoolActions', () => {
    it('true if trading is halted for this chain', () => {
      const result = disablePoolActions({
        chain: BNBChain,
        haltedChains: [ETHChain, BNBChain],
        mimirHalt: { ...DEFAULT_MIMIR_HALT }
      })
      expect(result).toBeTruthy()
    })

    it('true if LP is paused', () => {
      const result = disablePoolActions({
        chain: BNBChain,
        haltedChains: [ETHChain, BNBChain],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if BNB chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: BNBChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpBnb: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if BNB chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: BNBChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if BTC chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: BTCChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpBtc: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if BTC chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: BTCChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if BCH chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: BCHChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpBch: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if BCH chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: BCHChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if ETH chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: ETHChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpEth: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if ETH chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: ETHChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if LTC chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: LTCChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpLtc: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if LTC chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: LTCChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if DOGE chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: DOGEChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpDoge: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if DOGE chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: DOGEChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if Cosmos chain is not in halted list, but paused', () => {
      const result = disablePoolActions({
        chain: CosmosChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLpCosmos: true }
      })
      expect(result).toBeTruthy()
    })
    it('true if Cosmos chain is not in halted list, but LP paused', () => {
      const result = disablePoolActions({
        chain: CosmosChain,
        haltedChains: [],
        mimirHalt: { ...DEFAULT_MIMIR_HALT, pauseLp: true }
      })
      expect(result).toBeTruthy()
    })
  })
})
