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

import { Observable } from 'rxjs';
import { BaseAPI, HttpQuery, throwIfNullOrUndefined, encodeURI } from '../runtime';
import {
    TxResponse,
    TxSignersResponse,
} from '../models';

export interface TxRequest {
    hash: string;
    height?: number;
}

export interface TxSignersRequest {
    hash: string;
    height?: number;
}

/**
 * no description
 */
export class TransactionsApi extends BaseAPI {

    /**
     * Returns the observed transaction for a provided inbound or outbound hash.
     */
    tx = ({ hash, height }: TxRequest): Observable<TxResponse> => {
        throwIfNullOrUndefined(hash, 'tx');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<TxResponse>({
            path: '/thorchain/tx/{hash}'.replace('{hash}', encodeURI(hash)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns the signers for a provided inbound or outbound hash.
     */
    txSigners = ({ hash, height }: TxSignersRequest): Observable<TxSignersResponse> => {
        throwIfNullOrUndefined(hash, 'txSigners');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<TxSignersResponse>({
            path: '/thorchain/tx/{hash}/signers'.replace('{hash}', encodeURI(hash)),
            method: 'GET',
            query,
        });
    };

}
