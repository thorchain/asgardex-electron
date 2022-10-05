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
    MimirNodesResponse,
} from '../models';

export interface MimirRequest {
    height?: number;
}

export interface MimirAdminRequest {
    height?: number;
}

export interface MimirKeyRequest {
    key: string;
    height?: number;
}

export interface MimirNodeRequest {
    address: string;
    height?: number;
}

export interface MimirNodesRequest {
    height?: number;
}

/**
 * no description
 */
export class MimirApi extends BaseAPI {

    /**
     * Returns current active mimir configuration.
     */
    mimir = ({ height }: MimirRequest): Observable<{ [key: string]: string; }> => {

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<{ [key: string]: string; }>({
            path: '/thorchain/mimir',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns current admin mimir configuration.
     */
    mimirAdmin = ({ height }: MimirAdminRequest): Observable<{ [key: string]: string; }> => {

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<{ [key: string]: string; }>({
            path: '/thorchain/mimir/admin',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns current active mimir configuration for the provided key.
     */
    mimirKey = ({ key, height }: MimirKeyRequest): Observable<number> => {
        throwIfNullOrUndefined(key, 'mimirKey');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<number>({
            path: '/thorchain/mimir/key/{key}'.replace('{key}', encodeURI(key)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns current node mimir configuration for the provided node address.
     */
    mimirNode = ({ address, height }: MimirNodeRequest): Observable<{ [key: string]: string; }> => {
        throwIfNullOrUndefined(address, 'mimirNode');

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<{ [key: string]: string; }>({
            path: '/thorchain/mimir/node/{address}'.replace('{address}', encodeURI(address)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns current node mimir votes.
     */
    mimirNodes = ({ height }: MimirNodesRequest): Observable<MimirNodesResponse> => {

        const query: HttpQuery = {};

        if (height != null) { query['height'] = height; }

        return this.request<MimirNodesResponse>({
            path: '/thorchain/mimir/nodes_all',
            method: 'GET',
            query,
        });
    };

}
