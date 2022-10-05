// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.97.2
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    TxOutItem,
} from './';

/**
 * @export
 * @interface KeysignInfo
 */
export interface KeysignInfo {
    /**
     * the block(s) in which a tx out item is scheduled to be signed and moved from the scheduled outbound queue to the outbound queue
     * @type {number}
     * @memberof KeysignInfo
     */
    height?: number;
    /**
     * @type {Array<TxOutItem>}
     * @memberof KeysignInfo
     */
    tx_array: Array<TxOutItem>;
}
