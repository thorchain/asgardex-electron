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

/**
 * @export
 * @interface LastBlock
 */
export interface LastBlock {
    /**
     * @type {string}
     * @memberof LastBlock
     */
    chain: string;
    /**
     * @type {number}
     * @memberof LastBlock
     */
    last_observed_in: number;
    /**
     * @type {number}
     * @memberof LastBlock
     */
    last_signed_out: number;
    /**
     * @type {number}
     * @memberof LastBlock
     */
    thorchain: number;
}
