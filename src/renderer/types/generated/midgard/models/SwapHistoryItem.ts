// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.0.0-alpha.2
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface SwapHistoryItem
 */
export interface SwapHistoryItem {
    /**
     * Float, the average slip by swap. Big swaps have the same weight as small swaps
     * @type {string}
     * @memberof SwapHistoryItem
     */
    averageSlip: string;
    /**
     * Int64, The end time of bucket in unix timestamp
     * @type {string}
     * @memberof SwapHistoryItem
     */
    endTime: string;
    /**
     * Int64, The beginning time of bucket in unix timestamp
     * @type {string}
     * @memberof SwapHistoryItem
     */
    startTime: string;
    /**
     * Float, the average slip for swaps to asset. Big swaps have the same weight as small swaps 
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toAssetAverageSlip: string;
    /**
     * Int64, count of swaps from rune to asset
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toAssetCount: string;
    /**
     * Int64, the fees collected from swaps to asset denoted in rune
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toAssetFees: string;
    /**
     * Int64, volume of swaps from rune to asset denoted in rune
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toAssetVolume: string;
    /**
     * Float, the average slip for swaps to rune. Big swaps have the same weight as small swaps 
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toRuneAverageSlip: string;
    /**
     * Int64, count of swaps from asset to rune
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toRuneCount: string;
    /**
     * Int64, the fees collected from swaps to rune
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toRuneFees: string;
    /**
     * Int64, volume of swaps from asset to rune denoted in rune
     * @type {string}
     * @memberof SwapHistoryItem
     */
    toRuneVolume: string;
    /**
     * Int64, toAssetCount + toRuneCount
     * @type {string}
     * @memberof SwapHistoryItem
     */
    totalCount: string;
    /**
     * Int64, the sum of all fees collected denoted in rune
     * @type {string}
     * @memberof SwapHistoryItem
     */
    totalFees: string;
    /**
     * Int64, toAssetVolume + toRuneVolume (denoted in rune)
     * @type {string}
     * @memberof SwapHistoryItem
     */
    totalVolume: string;
}
