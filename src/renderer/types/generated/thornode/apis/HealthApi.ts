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
import { BaseAPI } from '../runtime';
import {
    Ping,
} from '../models';

/**
 * no description
 */
export class HealthApi extends BaseAPI {

    /**
     */
    ping = (): Observable<Ping> => {
        return this.request<Ping>({
            path: '/thorchain/ping',
            method: 'GET',
        });
    };

}
