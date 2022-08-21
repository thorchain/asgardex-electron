// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.89.0
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
 * @export
 * @interface Tx
 */
export interface Tx {
    /**
     * @type {string}
     * @memberof Tx
     */
    id?: string;
    /**
     * @type {string}
     * @memberof Tx
     */
    chain?: string;
    /**
     * @type {string}
     * @memberof Tx
     */
    from_address?: string;
    /**
     * @type {string}
     * @memberof Tx
     */
    to_address?: string;
    /**
     * @type {Array<Coin>}
     * @memberof Tx
     */
    coins: Array<Coin>;
    /**
     * @type {Array<Coin>}
     * @memberof Tx
     */
    gas: Array<Coin>;
    /**
     * @type {string}
     * @memberof Tx
     */
    memo?: string;
}
