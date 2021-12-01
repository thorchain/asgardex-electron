import * as RD from '@devexperts/remote-data-ts'
import {
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetToBase,
  assetToString,
  BCHChain,
  bn,
  BNBChain,
  BTCChain,
  Chain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET, RUNE_ADDRESS_TESTNET } from '../../../shared/mock/address'
import {
  ONE_RUNE_BASE_AMOUNT,
  TWO_RUNE_BASE_AMOUNT,
  THREE_RUNE_BASE_AMOUNT,
  FOUR_RUNE_BASE_AMOUNT
} from '../../../shared/mock/amount'
import { PRICE_POOLS_WHITELIST, AssetBUSDBAF, AssetUSDC, AssetUSDTDAC } from '../../const'
import { eqAsset, eqPoolShare, eqPoolShares, eqOBigNumber } from '../../helpers/fp/eq'
import { RUNE_POOL_ADDRESS, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { PoolDetail } from '../../types/generated/midgard'
import { PricePool, PricePools } from '../../views/pools/Pools.types'
import { PoolAddress, PoolShare, PoolShares, PoolsStateRD } from './types'
import {
  getPricePools,
  pricePoolSelector,
  pricePoolSelectorFromRD,
  getPoolDetail,
  toPoolData,
  filterPoolAssets,
  toPoolsData,
  getPoolAddressesByChain,
  combineShares,
  combineSharesByAsset,
  getSharesByAssetAndType,
  getPoolAssetDetail,
  getPoolAssetsDetail,
  inboundToPoolAddresses,
  getGasRateByChain
} from './utils'

describe('services/midgard/utils/', () => {
  describe('getPricePools', () => {
    const bnb = { asset: assetToString(AssetBNB), assetDepth: '1', runeDepth: '11' } as PoolDetail
    const eth = { asset: assetToString(AssetETH), assetDepth: '2', runeDepth: '22' } as PoolDetail
    const busd = { asset: assetToString(AssetBUSDBAF), assetDepth: '3', runeDepth: '33' } as PoolDetail
    const btc = { asset: assetToString(AssetBTC), assetDepth: '4', runeDepth: '44' } as PoolDetail
    const ltc = { asset: assetToString(AssetLTC), assetDepth: '5', runeDepth: '5' } as PoolDetail
    const usdc = { asset: assetToString(AssetUSDC), assetDepth: '66', runeDepth: '5' } as PoolDetail
    const usdt = { asset: assetToString(AssetUSDTDAC), assetDepth: '77', runeDepth: '5' } as PoolDetail

    it('returns list of price pools in a right order', () => {
      const result = getPricePools([bnb, eth, busd, btc, ltc], PRICE_POOLS_WHITELIST)

      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(AssetRuneNative)
      expect(pool0.poolData.runeBalance.amount().toNumber()).toEqual(ONE_RUNE_BASE_AMOUNT.amount().toNumber())
      expect(pool0.poolData.assetBalance.amount().toNumber()).toEqual(ONE_RUNE_BASE_AMOUNT.amount().toNumber())
      // BTC pool
      const btcPool = result[1]
      expect(btcPool.asset).toEqual(AssetBTC)
      expect(btcPool.poolData.runeBalance.amount().toNumber()).toEqual(44)
      expect(btcPool.poolData.assetBalance.amount().toNumber()).toEqual(4)
      // // ETH pool
      const ethPool = result[2]
      expect(ethPool.asset).toEqual(AssetETH)
      expect(ethPool.poolData.runeBalance.amount().toNumber()).toEqual(22)
      expect(ethPool.poolData.assetBalance.amount().toNumber()).toEqual(2)
      // // BUSDBAF pool
      const busdPool = result[3]
      expect(busdPool.asset).toEqual(AssetBUSDBAF)
      expect(busdPool.poolData.runeBalance.amount().toNumber()).toEqual(33)
      expect(busdPool.poolData.assetBalance.amount().toNumber()).toEqual(3)
    })

    it('returns RUNE price and btc pools in a right order', () => {
      const result = getPricePools([bnb, ltc, btc], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(2)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(AssetRuneNative)
      // BTC pool
      const btcPool = result[1]
      expect(btcPool.asset).toEqual(AssetBTC)
    })

    it('returns RUNE price pool only if another "price" pool is not available', () => {
      const result = getPricePools([bnb, ltc], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(1)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(AssetRuneNative)
    })

    it('returns price pools with deepest USD pool included', () => {
      const result = getPricePools([bnb, ltc, usdc, usdt], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(2)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(AssetRuneNative)
      // USD pool
      const pool1 = result[1]
      expect(pool1.asset).toEqual(AssetUSDTDAC)
    })
  })

  describe('pricePoolSelector', () => {
    const poolData = toPoolData({ assetDepth: '1', runeDepth: '1' })
    const eth: PricePool = { asset: AssetETH, poolData }
    const BUSDBAF: PricePool = { asset: AssetBUSDBAF, poolData }
    const btc: PricePool = { asset: AssetBTC, poolData }
    const rune: PricePool = RUNE_PRICE_POOL

    it('selects ETH pool', () => {
      const pool = pricePoolSelector([rune, eth, BUSDBAF, btc], O.some(AssetETH))
      expect(pool.asset).toEqual(AssetETH)
    })

    it('selects BUSDBAF pool if ETH pool is not available', () => {
      const pool = pricePoolSelector([rune, BUSDBAF, btc], O.some(AssetETH))
      expect(pool.asset).toEqual(AssetBUSDBAF)
    })

    it('selects BUSDBAF by default if no selection has been done', () => {
      const pool = pricePoolSelector([rune, eth, BUSDBAF, btc], O.none)
      expect(pool.asset).toEqual(AssetBUSDBAF)
    })

    it('selects RUNE if ETH + BUSDBAF pools are not available', () => {
      const pool = pricePoolSelector([rune, btc], O.some(AssetETH))
      expect(pool.asset).toEqual(AssetRuneNative)
    })
  })

  describe('pricePoolSelectorFromRD', () => {
    const poolData = toPoolData({ assetDepth: '1', runeDepth: '1' })
    const eth: PricePool = { asset: AssetETH, poolData }
    const BUSDBAF: PricePool = { asset: AssetBUSDBAF, poolData }
    const btc: PricePool = { asset: AssetBTC, poolData }
    const rune: PricePool = RUNE_PRICE_POOL
    const mockPoolsStateSuccess = (pricePools: PricePools): PoolsStateRD =>
      RD.success({
        assetDetails: [],
        poolAssets: [],
        poolDetails: [],
        poolsData: {},
        pricePools: O.some(pricePools)
      })

    it('selects ETH pool', () => {
      const poolsRD = mockPoolsStateSuccess([rune, eth, BUSDBAF, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(AssetETH))
      expect(pool.asset).toEqual(AssetETH)
    })

    it('selects BUSDBAF pool if ETH pool is not available', () => {
      const poolsRD = mockPoolsStateSuccess([rune, BUSDBAF, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(AssetETH))
      expect(pool.asset).toEqual(AssetBUSDBAF)
    })

    it('selects BUSDBAF by default if no selection has been done', () => {
      const poolsRD = mockPoolsStateSuccess([rune, eth, BUSDBAF, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.none)
      expect(pool.asset).toEqual(AssetBUSDBAF)
    })
    it('selects RUNE if ETH + BUSDBAF pools are not available', () => {
      const poolsRD = mockPoolsStateSuccess([rune, btc])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(AssetETH))
      expect(eqAsset.equals(pool.asset, AssetRuneNative)).toBeTruthy()
    })

    it('selects RUNE if no other price pool is available', () => {
      const poolsRD = mockPoolsStateSuccess([rune])
      const pool = pricePoolSelectorFromRD(poolsRD, O.some(AssetETH))
      expect(eqAsset.equals(pool.asset, AssetRuneNative)).toBeTruthy()
    })

    it('selects RUNE pool by default if loading other price pools failed', () => {
      const pool = pricePoolSelectorFromRD(RD.failure(new Error('Could not load pools')), O.none)
      expect(eqAsset.equals(pool.asset, AssetRuneNative)).toBeTruthy()
    })
  })

  describe('getPoolDetail', () => {
    const runeDetail = { asset: assetToString(AssetRuneNative) } as PoolDetail
    const bnbDetail = { asset: assetToString(AssetBNB) } as PoolDetail

    it('returns details of RUNE pool', () => {
      const result = getPoolDetail([runeDetail, bnbDetail], AssetRuneNative)
      expect(result).toEqual(O.some(runeDetail))
    })

    it('returns None if no RUNE details available', () => {
      const result = getPoolDetail([bnbDetail], AssetBTC)
      expect(result).toBeNone()
    })
  })

  describe('getPoolDetailsHashMap', () => {
    const runeDetail = { asset: assetToString(AssetRuneNative) } as PoolDetail
    const bnbDetail = { asset: assetToString(AssetBNB) } as PoolDetail

    it('returns hashMap of pool details', () => {
      const result = toPoolsData([runeDetail, bnbDetail])

      /**
       * Compare stringified structures 'cause
       * Jest compares amount's getter functions by
       * pointers and jest.mock does not work in terms
       * of single describe (only as global mock for file)
       */
      expect(JSON.stringify(result)).toEqual(
        JSON.stringify({
          [assetToString(AssetRuneNative)]: toPoolData(runeDetail),
          [assetToString(AssetBNB)]: toPoolData(bnbDetail)
        })
      )
    })
  })

  describe('filterPoolAssets', () => {
    it('returns empty list', () => {
      expect(filterPoolAssets([])).toEqual([])
    })
    it('filters out mini tokens', () => {
      expect(filterPoolAssets(['BNB.BNB', 'BNB.MINIA-7A2M', 'BNB.RUNE-B1A'])).toEqual(['BNB.BNB', 'BNB.RUNE-B1A'])
    })
  })

  describe('inboundToPoolAddresses', () => {
    it('adds rune pool address empty list', () => {
      expect(inboundToPoolAddresses([])).toEqual([RUNE_POOL_ADDRESS])
    })
    it('adds two `PoolAddress`es', () => {
      const result = inboundToPoolAddresses([{ chain: BNBChain, address: 'bnb-address', router: '', halted: false }])
      expect(result.length).toEqual(2)
      // RUNE `PoolAddress`
      expect(result[0]).toEqual(RUNE_POOL_ADDRESS)
      // bnb `PoolAddress`
      expect(result[1]).toEqual({
        chain: BNBChain,
        address: 'bnb-address',
        router: O.none,
        halted: false
      })
    })
  })

  describe('getPoolAddressesByChain', () => {
    const bnbAddress: PoolAddress = { address: 'bnb pool address', chain: BNBChain, router: O.none, halted: false }
    const thorAddress: PoolAddress = { address: 'thor pool address', chain: THORChain, router: O.none, halted: false }
    const btcAddress: PoolAddress = { address: 'btc pool address', chain: BTCChain, router: O.none, halted: false }
    const ethAddress: PoolAddress = { address: '0xaddress', chain: ETHChain, router: O.some('0xrouter'), halted: false }
    const addresses = [bnbAddress, thorAddress, btcAddress, ethAddress]

    it('returns BNB pool address ', () => {
      const result = getPoolAddressesByChain(addresses, BNBChain)
      expect(result).toEqual(O.some(bnbAddress))
    })

    it('returns ETHs pool address', () => {
      const result = getPoolAddressesByChain(addresses, ETHChain)
      expect(result).toEqual(O.some(ethAddress))
    })

    it('returns none if list of endpoints are empty', () => {
      expect(getPoolAddressesByChain([], BNBChain)).toBeNone()
    })

    it('returns none if chain is not in list of endpoints', () => {
      expect(getPoolAddressesByChain([bnbAddress, thorAddress], BTCChain)).toBeNone()
    })
  })

  describe('pool share helpers', () => {
    const ethShares: PoolShare = {
      asset: AssetETH,
      assetAddedAmount: ONE_RUNE_BASE_AMOUNT,
      units: bn('100000000'),
      assetAddress: 'eth-address',
      runeAddress: O.some(RUNE_ADDRESS_TESTNET),
      type: 'sym'
    }
    const bnbShares1: PoolShare = {
      asset: AssetBNB,
      assetAddedAmount: TWO_RUNE_BASE_AMOUNT,
      units: bn('200000000'),
      assetAddress: BNB_ADDRESS_TESTNET,
      runeAddress: O.some(RUNE_ADDRESS_TESTNET),
      type: 'sym'
    }
    const bnbShares2: PoolShare = {
      asset: AssetBNB,
      assetAddedAmount: THREE_RUNE_BASE_AMOUNT,
      units: bn('300000000'),
      assetAddress: BNB_ADDRESS_TESTNET,
      runeAddress: O.none,
      type: 'asym'
    }
    const btcShares: PoolShare = {
      asset: AssetBTC,
      assetAddedAmount: FOUR_RUNE_BASE_AMOUNT,
      units: bn('400000000'),
      assetAddress: 'btc-address',
      runeAddress: O.none,
      type: 'asym'
    }
    const shares: PoolShares = [ethShares, bnbShares1, bnbShares2, btcShares]

    describe('combineSharesByAsset', () => {
      it('returns none for empty list', () => {
        expect(combineSharesByAsset([], AssetBNB)).toBeNone()
      })

      it('returns none for non existing asset in list', () => {
        expect(combineSharesByAsset([], AssetRuneNative)).toBeNone()
      })

      it('merges BNB pool shares', () => {
        const oResult = combineSharesByAsset(shares, AssetBNB)

        expect(
          FP.pipe(
            oResult,
            O.map((share) =>
              eqPoolShare.equals(share, {
                asset: AssetBNB,
                assetAddedAmount: assetToBase(assetAmount(5)),
                units: bn('500000000'),
                assetAddress: BNB_ADDRESS_TESTNET,
                runeAddress: O.some(RUNE_ADDRESS_TESTNET),
                type: 'all'
              })
            ),
            O.getOrElse(() => false)
          )
        ).toBeTruthy()
      })
      it('merges ETH pool shares', () => {
        const result = combineSharesByAsset(shares, AssetETH)
        expect(FP.pipe(result, O.toNullable)).toEqual({
          asset: AssetETH,
          units: bn('100000000'),
          assetAddress: 'eth-address',
          runeAddress: O.some(RUNE_ADDRESS_TESTNET),
          assetAddedAmount: ONE_RUNE_BASE_AMOUNT,
          type: 'all'
        })
      })
    })

    describe('combineShares', () => {
      it('returns empty list', () => {
        expect(combineShares([])).toEqual([])
      })
      it('merges pool shares', () => {
        const expected: PoolShares = [
          {
            asset: AssetETH,
            assetAddedAmount: ONE_RUNE_BASE_AMOUNT,
            units: bn('100000000'),
            assetAddress: 'eth-address',
            runeAddress: O.some(RUNE_ADDRESS_TESTNET),
            type: 'all'
          },
          {
            asset: AssetBNB,
            assetAddedAmount: assetToBase(assetAmount(5)),
            units: bn('500000000'),
            assetAddress: BNB_ADDRESS_TESTNET,
            runeAddress: O.some(RUNE_ADDRESS_TESTNET),
            type: 'all'
          },
          {
            asset: AssetBTC,
            assetAddedAmount: FOUR_RUNE_BASE_AMOUNT,
            assetAddress: 'btc-address',
            runeAddress: O.none,
            units: bn('400000000'),
            type: 'all'
          }
        ]
        const result = combineShares(shares)
        expect(eqPoolShares.equals(result, expected)).toBeTruthy()
      })
    })

    describe('getSharesByAssetAndType', () => {
      it('returns none for empty list', () => {
        expect(getSharesByAssetAndType({ shares: [], asset: AssetBNB, type: 'sym' })).toBeNone()
      })

      it('returns none for non existing shares', () => {
        expect(getSharesByAssetAndType({ shares, asset: AssetBTC, type: 'sym' })).toBeNone()
      })

      it('gets sym. shares of BNB pools', () => {
        const oResult = getSharesByAssetAndType({ shares, asset: AssetBNB, type: 'sym' })
        expect(
          FP.pipe(
            oResult,
            O.map((result) => eqPoolShare.equals(result, bnbShares1)),
            O.getOrElse(() => false)
          )
        ).toBeTruthy()
      })

      it('gets asym. shares of BNB pools', () => {
        const oResult = getSharesByAssetAndType({ shares, asset: AssetBNB, type: 'asym' })
        expect(
          FP.pipe(
            oResult,
            O.map((result) => eqPoolShare.equals(result, bnbShares2)),
            O.getOrElse(() => false)
          )
        ).toBeTruthy()
      })
    })

    describe('getPoolAssetDetail', () => {
      it('returns none for empty list', () => {
        expect(getPoolAssetDetail({ assetPrice: '1', asset: 'BNB.BNB' })).toEqual(
          O.some({ assetPrice: bn(1), asset: AssetBNB })
        )
      })
      it('returns none for empty data of asset', () => {
        expect(getPoolAssetDetail({ assetPrice: '1', asset: '' })).toBeNone()
      })
    })

    describe('getPoolAssetsDetail', () => {
      it('returns a list of `PoolAssetDetail`s', () => {
        expect(
          getPoolAssetsDetail([
            { assetPrice: '1', asset: 'BNB.BNB' },
            { assetPrice: '2', asset: 'THOR.RUNE' }
          ])
        ).toEqual([
          { assetPrice: bn(1), asset: AssetBNB },
          { assetPrice: bn(2), asset: AssetRuneNative }
        ])
      })
      it('returns empty list in case of invalid data', () => {
        expect(getPoolAssetsDetail([{ assetPrice: '1', asset: '' }])).toEqual([])
      })
    })

    describe('getGasRateByChain', () => {
      const data: { chain: Chain; gas_rate?: string }[] = [
        { chain: BNBChain, gas_rate: '1' },
        { chain: ETHChain, gas_rate: '2' },
        { chain: BTCChain, gas_rate: '3' },
        { chain: LTCChain }, // no gas rate
        { chain: BCHChain, gas_rate: 'invalid' } // invalid gas rate
      ]

      it('gas rate for BNB', () => {
        const result = getGasRateByChain(data, BNBChain)
        expect(eqOBigNumber.equals(result, O.some(bn(1)))).toBeTruthy()
      })
      it('gas rate for ETH', () => {
        const result = getGasRateByChain(data, ETHChain)
        expect(eqOBigNumber.equals(result, O.some(bn(2)))).toBeTruthy()
      })
      it('none for missing gas rate (LTC)', () => {
        const result = getGasRateByChain(data, LTCChain)
        expect(result).toBeNone()
      })
      it('none for invalid gas rate (BCH)', () => {
        const result = getGasRateByChain(data, BCHChain)
        expect(result).toBeNone()
      })
    })
  })
})
