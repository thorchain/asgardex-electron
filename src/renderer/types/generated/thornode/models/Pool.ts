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

/**
 * @export
 * @interface Pool
 */
export interface Pool {
    /**
     * @type {string}
     * @memberof Pool
     */
    balance_rune: string;
    /**
     * @type {string}
     * @memberof Pool
     */
    balance_asset: string;
    /**
     * @type {string}
     * @memberof Pool
     */
    asset: string;
    /**
     * the total pool liquidity provider units
     * @type {string}
     * @memberof Pool
     */
    LP_units: string;
    /**
     * the total pool units, this is the sum of LP and synth units
     * @type {string}
     * @memberof Pool
     */
    pool_units: string;
    /**
     * @type {string}
     * @memberof Pool
     */
    status: string;
    /**
     * @type {number}
     * @memberof Pool
     */
    decimals?: number;
    /**
     * the total synth units in the pool
     * @type {string}
     * @memberof Pool
     */
    synth_units: string;
    /**
     * the total supply of synths for the asset
     * @type {string}
     * @memberof Pool
     */
    synth_supply: string;
    /**
     * @type {string}
     * @memberof Pool
     */
    pending_inbound_rune: string;
    /**
     * @type {string}
     * @memberof Pool
     */
    pending_inbound_asset: string;
}