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
 * @interface Tx
 */
export interface Tx {
    /**
     * @type {Array<string>}
     * @memberof Tx
     */
    out_hashes?: Array<string>;
    /**
     * @type {string}
     * @memberof Tx
     */
    block_height?: string;
    /**
     * @type {Array<string>}
     * @memberof Tx
     */
    signers?: Array<string>;
    /**
     * @type {string}
     * @memberof Tx
     */
    observed_pub_key?: string;
}
