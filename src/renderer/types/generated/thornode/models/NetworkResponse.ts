// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.100.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface NetworkResponse
 */
export interface NetworkResponse {
    /**
     * total amount of RUNE awarded to node operators
     * @type {string}
     * @memberof NetworkResponse
     */
    bond_reward_rune: string;
    /**
     * total of burned BEP2 RUNE
     * @type {string}
     * @memberof NetworkResponse
     */
    burned_bep_2_rune: string;
    /**
     * total of burned ERC20 RUNE
     * @type {string}
     * @memberof NetworkResponse
     */
    burned_erc_20_rune: string;
    /**
     * total bonded RUNE
     * @type {string}
     * @memberof NetworkResponse
     */
    total_bond_units: string;
    /**
     * total reserve RUNE
     * @type {string}
     * @memberof NetworkResponse
     */
    total_reserve: string;
    /**
     * Returns true if there exist RetiringVaults which have not finished migrating funds to new ActiveVaults
     * @type {boolean}
     * @memberof NetworkResponse
     */
    vaults_migrating: boolean;
}
