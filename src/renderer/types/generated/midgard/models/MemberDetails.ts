// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.6.9
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    MemberPool,
} from './';

/**
 * @export
 * @interface MemberDetails
 */
export interface MemberDetails {
    /**
     * List details of all the liquidity providers identified with the given address
     * @type {Array<MemberPool>}
     * @memberof MemberDetails
     */
    pools: Array<MemberPool>;
}
