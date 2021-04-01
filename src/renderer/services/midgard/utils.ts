import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { assetFromString, bnOrZero, baseAmount, Asset, assetToString, Chain, isChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { CURRENCY_WHEIGHTS } from '../../const'
import { isBUSDAsset } from '../../helpers/assetHelper'
import { isMiniToken } from '../../helpers/binanceHelper'
import { eqAsset, eqChain } from '../../helpers/fp/eq'
import { optionFromNullableString } from '../../helpers/fp/from'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { InboundAddressesItem, PoolDetail } from '../../types/generated/midgard'
import { PricePoolAssets, PricePools, PricePoolAsset, PricePool } from '../../views/pools/Pools.types'
import {
  PoolAssetDetails as PoolAssetsDetail,
  PoolDetails,
  PoolsStateRD,
  SelectedPricePoolAsset,
  PoolAssetDetail,
  PoolShares,
  PoolShare,
  PoolAddress,
  PoolAddresses,
  PoolsDataMap
} from './types'

export const getAssetDetail = (assets: PoolAssetsDetail, ticker: string): O.Option<PoolAssetDetail> =>
  FP.pipe(
    assets,
    A.findFirst(({ asset }: PoolAssetDetail) => asset.ticker === ticker)
  )

export const getPricePools = (pools: PoolDetails, whitelist?: PricePoolAssets): PricePools => {
  const poolDetails = !whitelist
    ? pools
    : pools.filter((detail) => whitelist.find((asset) => detail?.asset === assetToString(asset)))

  const pricePools = poolDetails
    .map((detail: PoolDetail) => {
      // Since we have filtered pools based on whitelist before ^,
      // we can type asset as `PricePoolAsset` now
      const asset = assetFromString(detail?.asset ?? '') as PricePoolAsset
      return {
        asset,
        poolData: toPoolData(detail)
      } as PricePool
    })
    // sort by weights (high weight wins)
    .sort((a, b) => (CURRENCY_WHEIGHTS[assetToString(b.asset)] || 0) - (CURRENCY_WHEIGHTS[assetToString(a.asset)] || 0))
  return [RUNE_PRICE_POOL, ...pricePools]
}

/**
 * Selector to get a `PricePool` from a list of `PricePools` by a given `PricePoolAsset`
 *
 * It will always return a `PricePool`:
 * - (1) `PricePool` from list of pools (if available)
 * - (2) OR BUSDB (if available in list of pools)
 * - (3) OR RUNE (if no other pool is available)
 */
export const pricePoolSelector = (pools: PricePools, oAsset: O.Option<PricePoolAsset>): PricePool =>
  FP.pipe(
    oAsset,
    // (1) Check if `PricePool` is available in `PricePools`
    O.mapNullable((asset) => pools.find((pool) => eqAsset.equals(pool.asset, asset))),
    // (2) If (1) fails, check if BUSDB pool is available in `PricePools`
    O.fold(() => O.fromNullable(pools.find((pool) => isBUSDAsset(pool.asset))), O.some),
    // (3) If (2) failes, return RUNE pool, which is always first entry in pools list
    O.getOrElse(() => NEA.head(pools))
  )

/**
 * Similar to `pricePoolSelector`, but taking `PoolsStateRD` instead of `PoolsState`
 */
export const pricePoolSelectorFromRD = (
  poolsRD: PoolsStateRD,
  selectedPricePoolAsset: SelectedPricePoolAsset
): PricePool =>
  FP.pipe(
    RD.toOption(poolsRD),
    O.chain((pools) => pools.pricePools),
    O.map((pricePools) => pricePoolSelector(pricePools, selectedPricePoolAsset)),
    O.getOrElse(() => RUNE_PRICE_POOL)
  )

/**
 * Gets a `PoolDetail by given Asset
 * It returns `None` if no `PoolDetail` has been found
 */
export const getPoolDetail = (details: PoolDetails, asset: Asset): O.Option<PoolDetail> =>
  FP.pipe(
    details.find((detail: PoolDetail) => {
      const { asset: detailAsset = '' } = detail
      const detailTicker = assetFromString(detailAsset)
      return detailTicker && eqAsset.equals(detailTicker, asset)
    }),
    O.fromNullable
  )

/**
 * Converts PoolDetails to the appropriate HashMap
 * Keys of the end HasMap is PoolDetails[i].asset
 */
export const getPoolDetailsHashMap = (poolDetails: PoolDetails, runeAsset: Asset): PoolsDataMap => {
  const res = poolDetails.reduce<PoolsDataMap>((acc, cur) => {
    if (!cur.asset) {
      return acc
    }

    return { ...acc, [cur.asset]: toPoolData(cur) }
  }, {})

  const runePricePool = RUNE_PRICE_POOL

  res[assetToString(runeAsset)] = {
    ...runePricePool.poolData
  }

  return res
}

/**
 * Transforms `PoolDetail` into `PoolData` (provided by `asgardex-util`)
 */
export const toPoolData = (detail: Pick<PoolDetail, 'assetDepth' | 'runeDepth'>): PoolData => ({
  assetBalance: baseAmount(bnOrZero(detail.assetDepth)),
  runeBalance: baseAmount(bnOrZero(detail.runeDepth))
})

/**
 * Filter out mini tokens from pool assets
 */
export const filterPoolAssets = (poolAssets: string[]) => {
  return poolAssets.filter((poolAsset) => !isMiniToken(assetFromString(poolAsset) || { symbol: '' }))
}

export const getPoolAddressesByChain = (addresses: PoolAddresses, chain: Chain): O.Option<PoolAddress> =>
  FP.pipe(
    addresses,
    A.findFirst((address) => eqChain.equals(address.chain, chain))
  )

export const toPoolAddresses = (
  addresses: Pick<InboundAddressesItem, 'chain' | 'address' | 'router'>[]
): PoolAddresses =>
  FP.pipe(
    addresses,
    A.filterMap(({ address, router, chain }) =>
      // filter out invalid chains
      isChain(chain)
        ? O.some({
            chain,
            address,
            router: optionFromNullableString(router)
          })
        : O.none
    )
  )

/**
 * Combines 'asym` + `sym` `Poolshare`'s of an `Asset` into a single `Poolshare` for this `Asset`
 *
 * @returns `PoolShares` List of combined `PoolShare` items for each `Asset`
 */
export const combineShares = (shares: PoolShares): PoolShares =>
  FP.pipe(
    shares,
    A.reduce<PoolShare, PoolShares>([], (acc, cur) =>
      FP.pipe(
        acc,
        A.findFirst(({ asset }) => eqAsset.equals(asset, cur.asset)),
        O.fold(
          () => [...acc, { ...cur, type: 'all' }],
          (value) => {
            value.units = cur.units.plus(value.units)
            value.assetAddedAmount = baseAmount(cur.assetAddedAmount.amount().plus(value.assetAddedAmount.amount()))
            value.type = 'all'
            return acc
          }
        )
      )
    )
  )

/**
 * Combines 'asym` + `sym` `Poolshare`'s into a single `Poolshare` by given `Asset` only
 *
 * @returns `O.Option<PoolShare>`  If `Poolshare`'s for given `Asset` exists, it combinens its `PoolShare`. If not, it returns `O.none`
 */
export const combineSharesByAsset = (shares: PoolShares, asset: Asset): O.Option<PoolShare> =>
  FP.pipe(
    shares,
    // filter shares for given asset
    A.filter(({ asset: poolAsset }) => eqAsset.equals(asset, poolAsset)),
    // merge shares
    A.reduce<PoolShare, O.Option<PoolShare>>(O.none, (oAcc, cur) => {
      return FP.pipe(
        oAcc,
        O.map(
          (acc): PoolShare => ({
            ...acc,
            units: cur.units.plus(acc.units),
            assetAddedAmount: baseAmount(cur.assetAddedAmount.amount().plus(acc.assetAddedAmount.amount())),
            type: 'all'
          })
        ),
        O.getOrElse<PoolShare>(() => ({ ...cur, type: 'all' })),
        O.some
      )
    })
  )

/**
 * Filters 'asym` or `sym` `Poolshare`'s by given `Asset`
 */
export const getSharesByAssetAndType = ({
  shares,
  asset,
  type
}: {
  shares: PoolShares
  asset: Asset
  type: 'sym' | 'asym'
}): O.Option<PoolShare> =>
  FP.pipe(
    shares,
    A.filter(({ asset: sharesAsset, type: sharesType }) => eqAsset.equals(asset, sharesAsset) && type === sharesType),
    A.head
  )

export const getPoolAssetDetail = ({
  asset: assetString,
  assetPrice
}: Pick<PoolDetail, 'assetPrice' | 'asset'>): O.Option<PoolAssetDetail> =>
  FP.pipe(
    assetString,
    assetFromString,
    O.fromNullable,
    O.map((asset) => ({
      asset,
      assetPrice: bnOrZero(assetPrice)
    }))
  )

export const getPoolAssetsDetail: (_: Array<Pick<PoolDetail, 'assetPrice' | 'asset'>>) => PoolAssetsDetail = (
  poolDetails
) => FP.pipe(poolDetails, A.filterMap(getPoolAssetDetail))
