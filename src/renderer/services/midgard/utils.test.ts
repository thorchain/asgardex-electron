import * as RD from '@devexperts/remote-data-ts'
import {
  assetAmount,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  assetToBase,
  assetToString,
  bn,
  BNBChain,
  BTCChain,
  ETHChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import {
  ONE_RUNE_BASE_AMOUNT,
  TWO_RUNE_BASE_AMOUNT,
  THREE_RUNE_BASE_AMOUNT,
  FOUR_RUNE_BASE_AMOUNT
} from '../../../shared/mock/amount'
import { PRICE_POOLS_WHITELIST, AssetBUSDBAF, ZERO_BN } from '../../const'
import { eqAsset, eqPoolShare, eqPoolShares } from '../../helpers/fp/eq'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { PricePool, PricePools } from '../../views/pools/Pools.types'
import { PoolAddress, PoolAssetDetail, PoolDetail, PoolShare, PoolShares, PoolsState, PoolsStateRD } from './types'
import {
  getAssetDetail,
  getPricePools,
  pricePoolSelector,
  pricePoolSelectorFromRD,
  getPoolDetail,
  toPoolData,
  filterPoolAssets,
  getPoolDetailsHashMap,
  getPoolAddressesByChain,
  combineShares,
  combineSharesByAsset,
  getSharesByAssetAndType,
  getPoolAssetDetail,
  getPoolAssetsDetail,
  toPoolAddresses
} from './utils'

describe('services/midgard/utils/', () => {
  describe('getAssetDetail', () => {
    const runeDetail: PoolAssetDetail = { asset: AssetRuneNative, assetPrice: ZERO_BN }
    const bnbDetail: PoolAssetDetail = { asset: AssetBNB, assetPrice: ZERO_BN }

    it('returns details of RUNE', () => {
      const result = getAssetDetail([runeDetail, bnbDetail], AssetRuneNative.ticker)
      expect(result).toEqual(O.some(runeDetail))
    })

    it('returns None if no RUNE details available', () => {
      const result = getAssetDetail([bnbDetail], 'TOMOB')
      expect(result).toBeNone()
    })
  })

  describe('getPricePools', () => {
    const tomob = { asset: 'BNB.TOMOB-1E1', assetDepth: '1', runeDepth: '11' } as PoolDetail
    const eth = { asset: 'ETH.ETH', assetDepth: '2', runeDepth: '22' } as PoolDetail
    const BUSDBAF = { asset: 'BNB.BUSD-BAF', assetDepth: '3', runeDepth: '33' } as PoolDetail
    const btc = { asset: 'BTC.BTC', assetDepth: '4', runeDepth: '44' } as PoolDetail
    const lok = { asset: 'BNB.LOK-3C0', assetDepth: '5', runeDepth: '5' } as PoolDetail

    it('returns list of price pools in a right order', () => {
      const result = getPricePools([tomob, eth, BUSDBAF, btc, lok], PRICE_POOLS_WHITELIST)
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
      const result = getPricePools([tomob, lok, btc], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(2)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(AssetRuneNative)
      // BTC pool
      const btcPool = result[1]
      expect(btcPool.asset).toEqual(AssetBTC)
    })

    it('returns RUNE price pool only if another "price" pool is not available', () => {
      const result = getPricePools([tomob, lok], PRICE_POOLS_WHITELIST)
      expect(result.length).toEqual(1)
      // RUNE pool
      const pool0 = result[0]
      expect(pool0.asset).toEqual(AssetRuneNative)
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
        pricePools: O.some(pricePools)
      } as PoolsState)

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
      const result = getPoolDetailsHashMap([runeDetail, bnbDetail], AssetRuneNative)

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

  describe('toPoolAddresses', () => {
    it('returns empty list', () => {
      expect(toPoolAddresses([])).toEqual([])
    })
  })

  describe('getPoolAddressesByChain', () => {
    const bnbAddress: PoolAddress = { address: 'bnb pool address', chain: BNBChain, router: O.none }
    const thorAddress: PoolAddress = { address: 'thor pool address', chain: THORChain, router: O.none }
    const btcAddress: PoolAddress = { address: 'btc pool address', chain: BTCChain, router: O.none }
    const ethAddress: PoolAddress = { address: '0xaddress', chain: ETHChain, router: O.some('0xrouter') }
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
      units: ONE_RUNE_BASE_AMOUNT,
      type: 'sym'
    }
    const bnbShares1: PoolShare = {
      asset: AssetBNB,
      assetAddedAmount: TWO_RUNE_BASE_AMOUNT,
      units: TWO_RUNE_BASE_AMOUNT,
      type: 'sym'
    }
    const bnbShares2: PoolShare = {
      asset: AssetBNB,
      assetAddedAmount: THREE_RUNE_BASE_AMOUNT,
      units: THREE_RUNE_BASE_AMOUNT,
      type: 'asym'
    }
    const btcShares: PoolShare = {
      asset: AssetBTC,
      assetAddedAmount: FOUR_RUNE_BASE_AMOUNT,
      units: FOUR_RUNE_BASE_AMOUNT,
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
                units: assetToBase(assetAmount(5)),
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
          units: ONE_RUNE_BASE_AMOUNT,
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
            units: ONE_RUNE_BASE_AMOUNT,
            type: 'all'
          },
          {
            asset: AssetBNB,
            assetAddedAmount: assetToBase(assetAmount(5)),
            units: assetToBase(assetAmount(5)),
            type: 'all'
          },
          {
            asset: AssetBTC,
            assetAddedAmount: FOUR_RUNE_BASE_AMOUNT,
            units: FOUR_RUNE_BASE_AMOUNT,
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
  })
})
