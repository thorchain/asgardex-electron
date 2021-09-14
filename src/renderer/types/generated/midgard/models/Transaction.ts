// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.4.1
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    Coin,
} from './';

/**
 * Transaction data
 * @export
 * @interface Transaction
 */
export interface Transaction {
    /**
     * Sender address
     * @type {string}
     * @memberof Transaction
     */
    address: string;
    /**
     * @type {Array<Coin>}
     * @memberof Transaction
     */
    coins: Array<Coin>;
    /**
     * Transaction id hash. Some transactions (such as outbound transactions made in the native asset) may have a zero value.
     * @type {string}
     * @memberof Transaction
     */
    txID: string;
}
