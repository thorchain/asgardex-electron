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

import {
    VaultRouter,
} from './';

/**
 * @export
 * @interface VaultInfo
 */
export interface VaultInfo {
    /**
     * @type {string}
     * @memberof VaultInfo
     */
    pub_key: string;
    /**
     * @type {Array<VaultRouter>}
     * @memberof VaultInfo
     */
    routers: Array<VaultRouter>;
}
