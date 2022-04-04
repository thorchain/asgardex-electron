import { getValueOfAsset1InAsset2, getValueOfRuneInAsset, PoolData } from '@thorchain/asgardex-util'
import { Balance } from '@xchainjs/xchain-client'
import { bnOrZero, assetFromString, AssetRuneNative, BaseAmount, Chain, THORChain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as Eq from 'fp-ts/lib/Eq'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Ord from 'fp-ts/lib/Ord'

import { Network } from '../../shared/api/types'
import { ONE_RUNE_BASE_AMOUNT } from '../../shared/mock/amount'
import { PoolAddress, PoolDetails } from '../services/midgard/types'
import { getPoolDetail, toPoolData } from '../services/midgard/utils'
import { MimirHaltChain, MimirHaltTrading, MimirPauseLP } from '../services/thorchain/types'
import { PoolDetail } from '../types/generated/midgard'
import { PoolTableRowData, PoolTableRowsData, PricePool } from '../views/pools/Pools.types'
import { getPoolTableRowData } from '../views/pools/Pools.utils'
import { convertBaseAmountDecimal, to1e8BaseAmount, isRuneAsset } from './assetHelper'
import { isBchChain, isBnbChain, isBtcChain, isDogeChain, isEthChain, isLtcChain, isTerraChain } from './chainHelper'
import { eqChain } from './fp/eq'
import { ordBaseAmount } from './fp/ord'
import { sequenceTOption, sequenceTOptionFromArray } from './fpHelpers'
import { emptyString } from './stringHelper'

export const sortByDepth = (a: PoolTableRowData, b: PoolTableRowData) =>
  ordBaseAmount.compare(a.depthPrice, b.depthPrice)

const ordByDepth = Ord.Contravariant.contramap(ordBaseAmount, ({ depthPrice }: PoolTableRowData) => depthPrice)

/**
 * RUNE based `PoolData`
 * Note: We don't have a "RUNE" pool in THORChain,
 * but do need such thing for pricing
 */
export const RUNE_POOL_DATA: PoolData = { assetBalance: ONE_RUNE_BASE_AMOUNT, runeBalance: ONE_RUNE_BASE_AMOUNT }

/**
 * RUNE based `PricePool`
 * Note: We don't have a "RUNE" pool in THORChain,
 * but do need such thing for pricing
 */
export const RUNE_PRICE_POOL: PricePool = {
  asset: AssetRuneNative,
  poolData: RUNE_POOL_DATA
}

/**
 * RUNE based `PoolAddresses`
 * Note: We don't have a "RUNE" pool in THORChain,
 * but do need such thing for handling pool txs
 */
export const RUNE_POOL_ADDRESS: PoolAddress = {
  chain: THORChain,
  // For RuneNative a `MsgNativeTx` is used for pool txs,
  // no need for a pool address, just keep it empty
  address: emptyString,
  halted: false,
  router: O.none
}

export const getPoolTableRowsData = ({
  poolDetails,
  pricePoolData,
  network
}: {
  poolDetails: PoolDetails
  pricePoolData: PoolData
  network: Network
}): PoolTableRowsData => {
  // get symbol of deepest pool
  const oDeepestPoolSymbol: O.Option<string> = FP.pipe(
    poolDetails,
    getDeepestPool,
    O.chain((poolDetail) => O.fromNullable(poolDetail.asset)),
    O.chain((assetString) => O.fromNullable(assetFromString(assetString))),
    O.map(({ symbol }) => symbol)
  )

  // Transform `PoolDetails` -> PoolRowType
  return FP.pipe(
    poolDetails,
    A.mapWithIndex<PoolDetail, O.Option<PoolTableRowData>>((index, poolDetail) => {
      // get symbol of PoolDetail
      const oPoolDetailSymbol: O.Option<string> = FP.pipe(
        O.fromNullable(assetFromString(poolDetail.asset ?? '')),
        O.map(({ symbol }) => symbol)
      )
      // compare symbols to set deepest pool
      const deepest = FP.pipe(
        sequenceTOption(oDeepestPoolSymbol, oPoolDetailSymbol),
        O.fold(
          () => false,
          ([deepestPoolSymbol, poolDetailSymbol]) => Eq.eqString.equals(deepestPoolSymbol, poolDetailSymbol)
        )
      )

      return FP.pipe(
        getPoolTableRowData({ poolDetail, pricePoolData, network }),
        O.map(
          (poolTableRowData) =>
            ({
              ...poolTableRowData,
              key: poolDetail?.asset || index.toString(),
              deepest
            } as PoolTableRowData)
        )
      )
    }),
    sequenceTOptionFromArray,
    O.getOrElse(() => [] as PoolTableRowsData),
    // Table does not accept `defaultSortOrder` for depth  for any reason,
    // that's why we sort depth here
    A.sortBy([ordByDepth]),
    // descending sort
    A.reverse
  )
}

/**
 * Filters a pool out with hightest value of RUNE
 */
export const getDeepestPool = (pools: PoolDetails): O.Option<PoolDetail> =>
  pools.reduce((acc: O.Option<PoolDetail>, pool: PoolDetail) => {
    const runeDepth = bnOrZero(pool.runeDepth)
    const prev = O.toNullable(acc)
    return runeDepth.isGreaterThanOrEqualTo(bnOrZero(prev?.runeDepth)) ? O.some(pool) : acc
  }, O.none)

/**
 * Converts Asset's pool price according to runePrice in selectedPriceAsset
 */
export const getAssetPoolPrice = (runePrice: BigNumber) => (poolDetail: Pick<PoolDetail, 'assetPrice'>) =>
  bnOrZero(poolDetail.assetPrice).multipliedBy(runePrice)

/**
 * Helper to get a pool price value for a given `Balance`
 */
export const getPoolPriceValue = ({
  balance: { asset, amount },
  poolDetails,
  pricePoolData,
  network
}: {
  balance: Balance
  poolDetails: PoolDetails
  pricePoolData: PoolData
  network: Network
}): O.Option<BaseAmount> => {
  // convert to 1e8 decimal (as same decimal as pool data has)
  const amount1e8 = to1e8BaseAmount(amount)
  return FP.pipe(
    getPoolDetail(poolDetails, asset),
    O.map(toPoolData),
    // calculate value based on `pricePoolData`
    O.map((poolData) => getValueOfAsset1InAsset2(amount1e8, poolData, pricePoolData)),
    O.alt(() => {
      // Calculate RUNE values based on `pricePoolData`
      if (isRuneAsset(asset, network)) {
        return O.some(getValueOfRuneInAsset(amount1e8, pricePoolData))
      }
      // In all other cases we don't have any price pool and no price
      return O.none
    }),
    // convert back to original decimal
    O.map((price) => convertBaseAmountDecimal(price, amount.decimal))
  )
}

const isChainElem = A.elem(eqChain)

/**
 * Helper to check if all pool actions (`SWAP`, `ADD`, `WITHDRAW`) have to be disabled
 *
 * |                  | ADD | WITHDRAW | SWAP |
 * |------------------|-----|----------|------|
 * | halt{chain}Chain | NO  | NO       | NO   |
 * | halt{chain}      | NO  | NO       | NO   |
 *
 */
export const disableAllActions = ({
  chain,
  haltedChains,
  mimirHalt: {
    haltThorChain,
    haltEthChain,
    haltBnbChain,
    haltLtcChain,
    haltBtcChain,
    haltBchChain,
    haltDogeChain,
    haltTerraChain
  }
}: {
  chain: Chain
  haltedChains: Chain[]
  mimirHalt: MimirHaltChain
}) => {
  // Check `haltThorChain` (provided by `mimir` endpoint) to disable all actions for all pools
  if (haltThorChain) return true

  // Check `haltBnbChain` (provided by `mimir` endpoint) to disable all actions for BNB pools
  if (isBnbChain(chain) && haltBnbChain) return true

  // Check `haltBtcChain` (provided by `mimir` endpoint) to disable all actions for BTC pools
  if (isBtcChain(chain) && haltBtcChain) return true

  // Check `haltBchChain` (provided by `mimir` endpoint) to disable all actions for BCH pools
  if (isBchChain(chain) && haltBchChain) return true

  // Check `haltLtcChain` (provided by `mimir` endpoint) to disable all actions for LTC pools
  if (isLtcChain(chain) && haltLtcChain) return true

  // Check `haltEthChain` (provided by `mimir` endpoint) to disable all actions for ETH pools
  if (isEthChain(chain) && haltEthChain) return true

  // Check `haltDogeChain` (provided by `mimir` endpoint) to disable all actions for DOGE pools
  if (isDogeChain(chain) && haltDogeChain) return true

  // Check `isTerraChain` (provided by `mimir` endpoint) to disable all actions for TERRA pools
  if (isTerraChain(chain) && haltTerraChain) return true

  // Check `chain` is included in `haltedChains` (provided by `inbound_addresses` endpoint)
  return FP.pipe(haltedChains, isChainElem(chain))
}

/**
 * Helper to check if pool trading actions (`SWAP`, `ADD`) have to be disabled
 *
 * |                    | ADD | WITHDRAW | SWAP |
 * |--------------------|-----|----------|------|
 * | halt{chain}Trading | NO  | YES      | NO   |
 * | halt{chain}        | NO  | NO       | NO   |
 */
export const disableTradingActions = ({
  chain,
  haltedChains,
  mimirHalt: {
    haltTrading,
    haltBtcTrading,
    haltEthTrading,
    haltBchTrading,
    haltLtcTrading,
    haltBnbTrading,
    haltDogeTrading,
    haltTerraTrading
  }
}: {
  chain: Chain
  haltedChains: Chain[]
  mimirHalt: MimirHaltTrading
}) => {
  // 1. Check `haltTrading` (provided by `mimir` endpoint) to disable all actions for all pools
  if (haltTrading) return true

  // 2. Check if trading is disabled for chain to disable all actions for pool
  if (isBtcChain(chain) && haltBtcTrading) return true
  if (isEthChain(chain) && haltEthTrading) return true
  if (isBchChain(chain) && haltBchTrading) return true
  if (isLtcChain(chain) && haltLtcTrading) return true
  if (isBnbChain(chain) && haltBnbTrading) return true
  if (isDogeChain(chain) && haltDogeTrading) return true
  if (isTerraChain(chain) && haltTerraTrading) return true

  // 3. Check `chain` is included in `haltedChains` (provided by `inbound_addresses` endpoint)
  return FP.pipe(haltedChains, isChainElem(chain))
}

/**
 * Helper to check if pool trading actions (`ADD`, `WITHDRAW`) have to be disabled
 *
 * |                | ADD | WITHDRAW | SWAP |
 * |----------------|-----|----------|------|
 * | pauseLP{chain} | NO  | NO       | YES  |
 * | halt{chain}    | NO  | NO       | NO   |
 */
export const disablePoolActions = ({
  chain,
  haltedChains,
  mimirHalt: { pauseLp, pauseLpBnb, pauseLpBch, pauseLpBtc, pauseLpEth, pauseLpLtc, pauseLpDoge, pauseLpTerra }
}: {
  chain: Chain
  haltedChains: Chain[]
  mimirHalt: MimirPauseLP
}) => {
  // Check all `pauseLp{chain}` values (provided by `mimir` endpoint) to disable pool actions
  if (pauseLp) return true
  if (isBnbChain(chain) && pauseLpBnb) return true
  if (isBchChain(chain) && pauseLpBch) return true
  if (isBtcChain(chain) && pauseLpBtc) return true
  if (isEthChain(chain) && pauseLpEth) return true
  if (isLtcChain(chain) && pauseLpLtc) return true
  if (isDogeChain(chain) && pauseLpDoge) return true
  if (isTerraChain(chain) && pauseLpTerra) return true

  // Check `chain` is included in `haltedChains` (provided by `inbound_addresses` endpoint)
  return FP.pipe(haltedChains, isChainElem(chain))
}
