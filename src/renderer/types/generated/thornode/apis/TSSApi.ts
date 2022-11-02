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

import { Observable } from 'rxjs';
import { BaseAPI, HttpQuery, throwIfNullOrUndefined, encodeURI } from '../runtime';
import {
    KeygenMetric,
    KeysignResponse,
    MetricsResponse,
} from '../models';

export interface KeysignRequest {
    height: number;
}

export interface KeysignPubkeyRequest {
    height: number;
    pubkey: string;
}

export interface MetricsRequest {
    height?: number;
}

export interface MetricsKeygenRequest {
    pubkey: string;
    height?: number;
}

/**
 * no description
 */
export class TSSApi extends BaseAPI {

    /**
     * Returns keysign information for the provided height - the height being the first block a tx out item appears in the signed-but-unobserved outbound queue.
     */
    keysign = ({ height }: KeysignRequest): Observable<KeysignResponse> => {
        throwIfNullOrUndefined(height, 'keysign');

        return this.request<KeysignResponse>({
            path: '/thorchain/keysign/{height}'.replace('{height}', encodeURI(height)),
            method: 'GET',
        });
    };

    /**
     * Returns keysign information for the provided height and pubkey - the height being the block at which a tx out item is scheduled to be signed and moved from the scheduled outbound queue to the outbound queue.
     */
    keysignPubkey = ({ height, pubkey }: KeysignPubkeyRequest): Observable<void> => {
        throwIfNullOrUndefined(height, 'keysignPubkey');
        throwIfNullOrUndefined(pubkey, 'keysignPubkey');

        return this.request<void>({
            path: '/thorchain/keysign/{height}/{pubkey}'.replace('{height}', encodeURI(height)).replace('{pubkey}', encodeURI(pubkey)),
            method: 'GET',
        });
    };

    /**
     * Returns keygen and keysign metrics for current vaults.
     */
    metrics = ({ height }: MetricsRequest): Observable<MetricsResponse> => {

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<MetricsResponse>({
            path: '/thorchain/metrics',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns keygen metrics for the provided vault pubkey.
     */
    metricsKeygen = ({ pubkey, height }: MetricsKeygenRequest): Observable<Array<KeygenMetric>> => {
        throwIfNullOrUndefined(pubkey, 'metricsKeygen');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<Array<KeygenMetric>>({
            path: '/thorchain/metric/keygen/{pubkey}'.replace('{pubkey}', encodeURI(pubkey)),
            method: 'GET',
            query,
        });
    };

}
