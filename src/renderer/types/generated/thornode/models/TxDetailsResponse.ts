// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.103.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    ObservedTx,
    Tx,
    TxOutItem,
} from './';

/**
 * @export
 * @interface TxDetailsResponse
 */
export interface TxDetailsResponse {
    /**
     * @type {string}
     * @memberof TxDetailsResponse
     */
    tx_id?: string;
    /**
     * @type {ObservedTx}
     * @memberof TxDetailsResponse
     */
    tx: ObservedTx;
    /**
     * @type {number}
     * @memberof TxDetailsResponse
     */
    height?: number;
    /**
     * @type {Array<ObservedTx>}
     * @memberof TxDetailsResponse
     */
    txs: Array<ObservedTx>;
    /**
     * @type {Array<TxOutItem>}
     * @memberof TxDetailsResponse
     */
    actions: Array<TxOutItem>;
    /**
     * @type {Array<Tx>}
     * @memberof TxDetailsResponse
     */
    out_txs: Array<Tx>;
    /**
     * the thorchain height at which the outbound was finalised
     * @type {number}
     * @memberof TxDetailsResponse
     */
    finalised_height?: number;
    /**
     * @type {boolean}
     * @memberof TxDetailsResponse
     */
    updated_vault?: boolean;
    /**
     * @type {boolean}
     * @memberof TxDetailsResponse
     */
    reverted?: boolean;
    /**
     * @type {number}
     * @memberof TxDetailsResponse
     */
    outbound_height?: number;
}
