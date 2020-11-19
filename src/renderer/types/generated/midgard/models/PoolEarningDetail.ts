// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 0.7.1
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface PoolEarningDetail
 */
export interface PoolEarningDetail {
    /**
     * number of days that pool was enabled in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthActiveDays?: string;
    /**
     * sum of asset donated to the pool by add event in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthAssetDonation?: string;
    /**
     * sum of buy fee in rune in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthBuyFee?: string;
    /**
     * sum of gas paid from asset of this pool in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthGasPaid?: string;
    /**
     * sum of gas reimbursed to rune of this pool in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthGasReimbursed?: string;
    /**
     * sum of pool deficit in reward event in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthPoolDeficit?: string;
    /**
     * sum of donation to this pool in past 30 days (lastMonthAssetDonation*price + lastMonthRuneDonation)
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthPoolDonation?: string;
    /**
     * sum of pool Earning in past 30 days (lastMonthPoolDonation + lastMonthPoolFee + lastMonthReward + lastMonthPoolDeficit + lastMonthGasReimbursed - (lastMonthGasPaid * price))
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthPoolEarning?: string;
    /**
     * sum of pool sell fee in rune in past 30 days (lastMonthBuyFee+lastMonthSellFee)
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthPoolFee?: string;
    /**
     * sum of rewards in reward event in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthReward?: string;
    /**
     * sum of rune donated to the pool by add event in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthRuneDonation?: string;
    /**
     * sum of sell fee in rune in past 30 days
     * @type {string}
     * @memberof PoolEarningDetail
     */
    lastMonthSellFee?: string;
    /**
     * lastMonthPoolEarning/poolDepth (lastMonthPoolEarning may extrapolate if pool was active less than 30 days)
     * @type {string}
     * @memberof PoolEarningDetail
     */
    periodicRate?: string;
    /**
     * pool name
     * @type {string}
     * @memberof PoolEarningDetail
     */
    pool?: string;
    /**
     * (1 + periodicRate ) ^ 12 -1
     * @type {string}
     * @memberof PoolEarningDetail
     */
    poolAPY?: string;
    /**
     * pool depth (2 * rune depth)
     * @type {string}
     * @memberof PoolEarningDetail
     */
    poolDepth?: string;
    /**
     * pool price in rune
     * @type {string}
     * @memberof PoolEarningDetail
     */
    price?: string;
    /**
     * sum of asset donated to the pool by add event
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalAssetDonation?: string;
    /**
     * sum of buy fee in rune
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalBuyFee?: string;
    /**
     * sum of gas paid from asset of this pool
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalGasPaid?: string;
    /**
     * sum of gas reimbursed to rune of this pool
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalGasReimbursed?: string;
    /**
     * sum of pool deficit in reward event
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalPoolDeficit?: string;
    /**
     * sum of donation to this pool (totalAssetDonation*price + totalRuneDonation)
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalPoolDonation?: string;
    /**
     * sum of pool Earning (totalPoolDonation+totalPoolFee + totalReward + totalPoolDeficit + totalGasReimbursed - (totalGasPaid * price))
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalPoolEarning?: string;
    /**
     * sum of pool sell fee in rune (sellFee+buyFee)
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalPoolFee?: string;
    /**
     * sum of rewards in reward event
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalReward?: string;
    /**
     * sum of rune donated to the pool by add event
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalRuneDonation?: string;
    /**
     * sum of sell fee in rune
     * @type {string}
     * @memberof PoolEarningDetail
     */
    totalSellFee?: string;
}
