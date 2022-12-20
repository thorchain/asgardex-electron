// tslint:disable
/**
 * Thornode API
 * Thornode REST API.
 *
 * The version of the OpenAPI document: 1.101.0
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    QuoteFees,
} from './';

/**
 * @export
 * @interface QuoteSwapResponse
 */
export interface QuoteSwapResponse {
    /**
     * the inbound address for the transaction on the source chain
     * @type {string}
     * @memberof QuoteSwapResponse
     */
    inbound_address: string;
    /**
     * generated memo for the swap
     * @type {string}
     * @memberof QuoteSwapResponse
     */
    memo?: string;
    /**
     * the minimum amount of the target asset the user can expect to receive after fees
     * @type {string}
     * @memberof QuoteSwapResponse
     */
    expected_amount_out: string;
    /**
     * the approximate number of source chain blocks required before processing
     * @type {number}
     * @memberof QuoteSwapResponse
     */
    inbound_confirmation_blocks?: number;
    /**
     * the approximate seconds for block confirmations required before processing
     * @type {number}
     * @memberof QuoteSwapResponse
     */
    inbound_confirmation_seconds?: number;
    /**
     * the number of thorchain blocks the outbound will be delayed
     * @type {number}
     * @memberof QuoteSwapResponse
     */
    outbound_delay_blocks: number;
    /**
     * the approximate seconds for the outbound delay before it will be sent
     * @type {number}
     * @memberof QuoteSwapResponse
     */
    outbound_delay_seconds: number;
    /**
     * @type {QuoteFees}
     * @memberof QuoteSwapResponse
     */
    fees: QuoteFees;
    /**
     * the swap slippage in basis points
     * @type {number}
     * @memberof QuoteSwapResponse
     */
    slippage_bps: number;
}
