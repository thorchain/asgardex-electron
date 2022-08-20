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
    ObservedTx,
} from './';

/**
 * @export
 * @interface TxSignersResponse
 */
export interface TxSignersResponse {
    /**
     * @type {string}
     * @memberof TxSignersResponse
     */
    tx_id?: string;
    /**
     * @type {ObservedTx}
     * @memberof TxSignersResponse
     */
    tx: ObservedTx;
    /**
     * @type {number}
     * @memberof TxSignersResponse
     */
    height?: number;
    /**
     * @type {Array<ObservedTx>}
     * @memberof TxSignersResponse
     */
    txs: Array<ObservedTx>;
    /**
     * @type {Array<ObservedTx>}
     * @memberof TxSignersResponse
     */
    actions: Array<ObservedTx>;
    /**
     * @type {Array<string>}
     * @memberof TxSignersResponse
     */
    out_txs: Array<string>;
    /**
     * the thorchain height at which the outbound was finalised
     * @type {number}
     * @memberof TxSignersResponse
     */
    finalised_height?: number;
    /**
     * @type {boolean}
     * @memberof TxSignersResponse
     */
    updated_vault?: boolean;
    /**
     * @type {boolean}
     * @memberof TxSignersResponse
     */
    reverted?: boolean;
    /**
     * @type {number}
     * @memberof TxSignersResponse
     */
    outbound_height?: number;
}
