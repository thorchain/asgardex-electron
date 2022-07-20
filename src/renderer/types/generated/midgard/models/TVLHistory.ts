// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 2.9.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    TVLHistoryItem,
} from './';

/**
 * @export
 * @interface TVLHistory
 */
export interface TVLHistory {
    /**
     * @type {Array<TVLHistoryItem>}
     * @memberof TVLHistory
     */
    intervals: Array<TVLHistoryItem>;
    /**
     * @type {TVLHistoryItem}
     * @memberof TVLHistory
     */
    meta: TVLHistoryItem;
}
