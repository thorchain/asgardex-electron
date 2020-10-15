// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 0.3.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface PoolDetail
 */
export interface PoolDetail {
    /**
     * @type {string}
     * @memberof PoolDetail
     */
    asset?: string;
    /**
     * Total current Asset balance
     * @type {string}
     * @memberof PoolDetail
     */
    assetDepth?: string;
    /**
     * Amount of pool asset changed by fee and gas
     * @type {string}
     * @memberof PoolDetail
     */
    assetEarned?: string;
    /**
     * Asset return on investment
     * @type {string}
     * @memberof PoolDetail
     */
    assetROI?: string;
    /**
     * Total Asset staked
     * @type {string}
     * @memberof PoolDetail
     */
    assetStakedTotal?: string;
    /**
     * Number of RUNE->ASSET transactions
     * @type {string}
     * @memberof PoolDetail
     */
    buyAssetCount?: string;
    /**
     * Average sell Asset fee size for RUNE->ASSET (in ASSET)
     * @type {string}
     * @memberof PoolDetail
     */
    buyFeeAverage?: string;
    /**
     * Total fees (in Asset)
     * @type {string}
     * @memberof PoolDetail
     */
    buyFeesTotal?: string;
    /**
     * Average trade slip for RUNE->ASSET in %
     * @type {string}
     * @memberof PoolDetail
     */
    buySlipAverage?: string;
    /**
     * Average Asset buy transaction size for (RUNE->ASSET) (in ASSET)
     * @type {string}
     * @memberof PoolDetail
     */
    buyTxAverage?: string;
    /**
     * Total Asset buy volume (RUNE->ASSET) (in Asset)
     * @type {string}
     * @memberof PoolDetail
     */
    buyVolume?: string;
    /**
     * Total depth of both sides (in RUNE)
     * @type {string}
     * @memberof PoolDetail
     */
    poolDepth?: string;
    /**
     * (assetChanges * price) + runeEarned
     * @type {string}
     * @memberof PoolDetail
     */
    poolEarned?: string;
    /**
     * Average pool fee
     * @type {string}
     * @memberof PoolDetail
     */
    poolFeeAverage?: string;
    /**
     * Total fees
     * @type {string}
     * @memberof PoolDetail
     */
    poolFeesTotal?: string;
    /**
     * Pool ROI (average of RUNE and Asset ROI)
     * @type {string}
     * @memberof PoolDetail
     */
    poolROI?: string;
    /**
     * Pool ROI over 12 months
     * @type {string}
     * @memberof PoolDetail
     */
    poolROI12?: string;
    /**
     * Average pool slip
     * @type {string}
     * @memberof PoolDetail
     */
    poolSlipAverage?: string;
    /**
     * Rune value staked Total
     * @type {string}
     * @memberof PoolDetail
     */
    poolStakedTotal?: string;
    /**
     * Average pool transaction
     * @type {string}
     * @memberof PoolDetail
     */
    poolTxAverage?: string;
    /**
     * Total pool units outstanding
     * @type {string}
     * @memberof PoolDetail
     */
    poolUnits?: string;
    /**
     * Two-way volume of all-time (in RUNE)
     * @type {string}
     * @memberof PoolDetail
     */
    poolVolume?: string;
    /**
     * Two-way volume in 24hrs (in RUNE)
     * @type {string}
     * @memberof PoolDetail
     */
    poolVolume24hr?: string;
    /**
     * Price of Asset (in RUNE).
     * @type {string}
     * @memberof PoolDetail
     */
    price?: string;
    /**
     * Total current Rune balance
     * @type {string}
     * @memberof PoolDetail
     */
    runeDepth?: string;
    /**
     * Amount of pool rune changed by fee,reward and gas
     * @type {string}
     * @memberof PoolDetail
     */
    runeEarned?: string;
    /**
     * RUNE return on investment
     * @type {string}
     * @memberof PoolDetail
     */
    runeROI?: string;
    /**
     * Total RUNE staked
     * @type {string}
     * @memberof PoolDetail
     */
    runeStakedTotal?: string;
    /**
     * Number of ASSET->RUNE transactions
     * @type {string}
     * @memberof PoolDetail
     */
    sellAssetCount?: string;
    /**
     * Average buy Asset fee size for ASSET->RUNE (in RUNE)
     * @type {string}
     * @memberof PoolDetail
     */
    sellFeeAverage?: string;
    /**
     * Total fees (in RUNE)
     * @type {string}
     * @memberof PoolDetail
     */
    sellFeesTotal?: string;
    /**
     * Average trade slip for ASSET->RUNE in %
     * @type {string}
     * @memberof PoolDetail
     */
    sellSlipAverage?: string;
    /**
     * Average Asset sell transaction size (ASSET>RUNE) (in RUNE)
     * @type {string}
     * @memberof PoolDetail
     */
    sellTxAverage?: string;
    /**
     * Total Asset sell volume (ASSET>RUNE) (in RUNE).
     * @type {string}
     * @memberof PoolDetail
     */
    sellVolume?: string;
    /**
     * Number of stake transactions
     * @type {string}
     * @memberof PoolDetail
     */
    stakeTxCount?: string;
    /**
     * Number of unique stakers
     * @type {string}
     * @memberof PoolDetail
     */
    stakersCount?: string;
    /**
     * Number of stake & withdraw transactions
     * @type {string}
     * @memberof PoolDetail
     */
    stakingTxCount?: string;
    /**
     * @type {string}
     * @memberof PoolDetail
     */
    status?: PoolDetailStatusEnum;
    /**
     * Number of unique swappers interacting with pool
     * @type {string}
     * @memberof PoolDetail
     */
    swappersCount?: string;
    /**
     * Number of swapping transactions in the pool (buys and sells)
     * @type {string}
     * @memberof PoolDetail
     */
    swappingTxCount?: string;
    /**
     * Number of withdraw transactions
     * @type {string}
     * @memberof PoolDetail
     */
    withdrawTxCount?: string;
}

/**
 * @export
 * @enum {string}
 */
export enum PoolDetailStatusEnum {
    Bootstrapped = 'bootstrapped',
    Enabled = 'enabled',
    Disabled = 'disabled'
}

