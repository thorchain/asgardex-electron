// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.11.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface PoolStatsDetail
 */
export interface PoolStatsDetail {
    /**
     * Int64(e8), same as history/liquidity_changes:addAssetLiquidityVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    addAssetLiquidityVolume: string;
    /**
     * Int64, same as history/liquidity_changes:addLiquidityCount
     * @type {string}
     * @memberof PoolStatsDetail
     */
    addLiquidityCount: string;
    /**
     * Int64(e8), same as history/liquidity_changes:addLiquidityVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    addLiquidityVolume: string;
    /**
     * Int64(e8), same as history/liquidity_changes:addRuneLiquidityVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    addRuneLiquidityVolume: string;
    /**
     * Float, Also called APR. Annual return estimated linearly (not compounded) from a period of typically the last 30 or 100 days (configurable by the period parameter, default is 30). E.g. 0.1 means 10% yearly return. Due to Impermanent Loss and Synths this might be negative, but given Impermanent Loss Protection for 100+ day members, frontends might show MAX(APR, 0). 
     * @type {string}
     * @memberof PoolStatsDetail
     */
    annualPercentageRate: string;
    /**
     * @type {string}
     * @memberof PoolStatsDetail
     */
    asset: string;
    /**
     * Int64(e8), the amount of Asset in the pool
     * @type {string}
     * @memberof PoolStatsDetail
     */
    assetDepth: string;
    /**
     * Float, price of asset in rune. I.e. rune amount / asset amount
     * @type {string}
     * @memberof PoolStatsDetail
     */
    assetPrice: string;
    /**
     * Float, the price of asset in USD (based on the deepest USD pool).
     * @type {string}
     * @memberof PoolStatsDetail
     */
    assetPriceUSD: string;
    /**
     * Float64 (Basis points, 0-10000, where 10000=100%), same as history/swaps:averageSlip 
     * @type {string}
     * @memberof PoolStatsDetail
     */
    averageSlip: string;
    /**
     * Int64(e8), part of the withdrawRuneVolume which was payed because of impermanent loss protection. 
     * @type {string}
     * @memberof PoolStatsDetail
     */
    impermanentLossProtectionPaid: string;
    /**
     * Int64, Liquidity Units in the pool
     * @type {string}
     * @memberof PoolStatsDetail
     */
    liquidityUnits: string;
    /**
     * Float, MAX(AnnualPercentageRate, 0) 
     * @type {string}
     * @memberof PoolStatsDetail
     */
    poolAPY: string;
    /**
     * Int64(e8), the amount of Rune in the pool
     * @type {string}
     * @memberof PoolStatsDetail
     */
    runeDepth: string;
    /**
     * The state of the pool, e.g. Available, Staged
     * @type {string}
     * @memberof PoolStatsDetail
     */
    status: string;
    /**
     * Int64, same as history/swaps:totalCount
     * @type {string}
     * @memberof PoolStatsDetail
     */
    swapCount: string;
    /**
     * Int64(e8), same as history/swaps:totalVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    swapVolume: string;
    /**
     * Int64, Synth supply in the pool
     * @type {string}
     * @memberof PoolStatsDetail
     */
    synthSupply: string;
    /**
     * Int64, Synth Units in the pool
     * @type {string}
     * @memberof PoolStatsDetail
     */
    synthUnits: string;
    /**
     * Float64 (Basis points, 0-10000, where 10000=100%), same as history/swaps:toAssetAverageSlip 
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toAssetAverageSlip: string;
    /**
     * Int64, same as history/swaps:toAssetCount
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toAssetCount: string;
    /**
     * Int64(e8), same as history/swaps:toAssetFees
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toAssetFees: string;
    /**
     * Int64(e8), same as history/swaps:toAssetVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toAssetVolume: string;
    /**
     * Float64 (Basis points, 0-10000, where 10000=100%), same as history/swaps:toRuneAverageSlip 
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toRuneAverageSlip: string;
    /**
     * Int64, same as history/swaps:toRuneCount
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toRuneCount: string;
    /**
     * Int64(e8), same as history/swaps:toRuneFees
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toRuneFees: string;
    /**
     * Int64(e8), same as history/swaps:toRuneVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    toRuneVolume: string;
    /**
     * Int64(e8), same as history/swaps:totalFees
     * @type {string}
     * @memberof PoolStatsDetail
     */
    totalFees: string;
    /**
     * Int64, same as len(history/members?pool=POOL)
     * @type {string}
     * @memberof PoolStatsDetail
     */
    uniqueMemberCount: string;
    /**
     * Deprecated, it\'s always 0.
     * @type {string}
     * @memberof PoolStatsDetail
     */
    uniqueSwapperCount: string;
    /**
     * Int64, Total Units (synthUnits + liquidityUnits) in the pool
     * @type {string}
     * @memberof PoolStatsDetail
     */
    units: string;
    /**
     * Int64(e8), same as history/liquidity_changes:withdrawAssetVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    withdrawAssetVolume: string;
    /**
     * Int64, same as history/liquidity_changes:withdrawCount
     * @type {string}
     * @memberof PoolStatsDetail
     */
    withdrawCount: string;
    /**
     * Int64(e8), same as history/liquidity_changes:withdrawRuneVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    withdrawRuneVolume: string;
    /**
     * Int64(e8), same as history/liquidity_changes:withdrawVolume
     * @type {string}
     * @memberof PoolStatsDetail
     */
    withdrawVolume: string;
}
