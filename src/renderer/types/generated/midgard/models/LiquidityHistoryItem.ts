// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.0.0-alpha.3
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface LiquidityHistoryItem
 */
export interface LiquidityHistoryItem {
    /**
     * Int64 (10^8), total assets deposited during the time interval. Denoted in Rune using the price at deposit time. 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    addAssetLiquidityVolume: string;
    /**
     * Int64, number of deposits during the time interval. 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    addLiquidityCount: string;
    /**
     * Int64 (10^8), total of rune and asset deposits. Denoted in Rune (using the price at deposit time). 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    addLiquidityVolume: string;
    /**
     * Int64 (10^8), total Rune deposited during the time interval. 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    addRuneLiquidityVolume: string;
    /**
     * Int64, The end time of bucket in unix timestamp
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    endTime: string;
    /**
     * Int64, net liquidity changes (withdrawals - deposits) during the time interval
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    net: string;
    /**
     * Int64, The beginning time of bucket in unix timestamp
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    startTime: string;
    /**
     * Int64 (10^8), total assets withdrawn during the time interval. Denoted in Rune using the price at withdraw time. 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    withdrawAssetVolume: string;
    /**
     * Int64, number of withdraw during the time interval. 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    withdrawCount: string;
    /**
     * Int64 (10^8), total Rune withdrawn during the time interval. 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    withdrawRuneVolume: string;
    /**
     * Int64 (10^8), total of rune and asset withdrawals. Denoted in Rune (using the price at withdraw time). 
     * @type {string}
     * @memberof LiquidityHistoryItem
     */
    withdrawVolume: string;
}
