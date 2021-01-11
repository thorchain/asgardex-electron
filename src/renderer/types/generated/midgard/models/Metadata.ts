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

import {
    AddLiquidityMetadata,
    RefundMetadata,
    SwapMetadata,
    WithdrawMetadata,
} from './';

/**
 * @export
 * @interface Metadata
 */
export interface Metadata {
    /**
     * @type {AddLiquidityMetadata}
     * @memberof Metadata
     */
    addLiquidity?: AddLiquidityMetadata;
    /**
     * @type {RefundMetadata}
     * @memberof Metadata
     */
    refund?: RefundMetadata;
    /**
     * @type {SwapMetadata}
     * @memberof Metadata
     */
    swap?: SwapMetadata;
    /**
     * @type {WithdrawMetadata}
     * @memberof Metadata
     */
    withdraw?: WithdrawMetadata;
}
