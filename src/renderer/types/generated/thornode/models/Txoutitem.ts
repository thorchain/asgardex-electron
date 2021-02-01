// tslint:disable
/**
 * THORChain API
 * This documentation outlines the API for THORChain.  NOTE: This document is a **work in progress**.
 *
 * The version of the OpenAPI document: 
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface Txoutitem
 */
export interface Txoutitem {
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    chain?: string;
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    to?: string;
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    vault_pubkey?: string;
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    memo?: string;
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    gas_rate?: string;
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    in_hash?: string;
    /**
     * @type {string}
     * @memberof Txoutitem
     */
    out_hash?: string;
}
