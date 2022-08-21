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

import { Observable } from 'rxjs';
import { BaseAPI, HttpQuery, throwIfNullOrUndefined, encodeURI } from '../runtime';
import {
    Balance,
    ChurnItem,
    Constants,
    DepthHistory,
    EarningsHistory,
    Health,
    InboundAddressesItem,
    InlineResponse200,
    LastblockItem,
    LiquidityHistory,
    MemberDetails,
    Network,
    Node,
    PoolDetail,
    PoolStatsDetail,
    ProxiedNode,
    Queue,
    StatsData,
    SwapHistory,
    THORNameDetails,
    TVLHistory,
} from '../models';

export interface GetActionsRequest {
    address?: string;
    txid?: string;
    asset?: string;
    type?: string;
    affiliate?: string;
    limit?: number;
    offset?: number;
}

export interface GetBalanceRequest {
    address: string;
    timestamp?: number;
    height?: number;
}

export interface GetDepthHistoryRequest {
    pool: string;
    interval?: GetDepthHistoryIntervalEnum;
    count?: number;
    to?: number;
    from?: number;
}

export interface GetEarningsHistoryRequest {
    interval?: GetEarningsHistoryIntervalEnum;
    count?: number;
    to?: number;
    from?: number;
}

export interface GetLiquidityHistoryRequest {
    pool?: string;
    interval?: GetLiquidityHistoryIntervalEnum;
    count?: number;
    to?: number;
    from?: number;
}

export interface GetMemberDetailRequest {
    address: string;
}

export interface GetMembersAdressesRequest {
    pool?: string;
}

export interface GetPoolRequest {
    asset: string;
    period?: GetPoolPeriodEnum;
}

export interface GetPoolStatsRequest {
    asset: string;
    period?: GetPoolStatsPeriodEnum;
}

export interface GetPoolsRequest {
    status?: GetPoolsStatusEnum;
    period?: GetPoolsPeriodEnum;
}

export interface GetSwapHistoryRequest {
    pool?: string;
    interval?: GetSwapHistoryIntervalEnum;
    count?: number;
    to?: number;
    from?: number;
}

export interface GetTHORNameDetailRequest {
    name: string;
}

export interface GetTHORNamesByAddressRequest {
    address: string;
}

export interface GetTHORNamesOwnerByAddressRequest {
    address: string;
}

export interface GetTVLHistoryRequest {
    interval?: GetTVLHistoryIntervalEnum;
    count?: number;
    to?: number;
    from?: number;
}

/**
 * no description
 */
export class DefaultApi extends BaseAPI {

    /**
     * List actions along with their related transactions. An action is generated by one or more inbound transactions with the intended action set in the transaction memo. The action may result in one or more outbound transactions. Results are paginated by sets of 50. Filters may be applied to query actions. 
     * Actions List
     */
    getActions = ({ address, txid, asset, type, affiliate, limit, offset }: GetActionsRequest): Observable<InlineResponse200> => {

        const query: HttpQuery = {};

        if (address != null) { query['address'] = address; }
        if (txid != null) { query['txid'] = txid; }
        if (asset != null) { query['asset'] = asset; }
        if (type != null) { query['type'] = type; }
        if (affiliate != null) { query['affiliate'] = affiliate; }
        if (limit != null) { query['limit'] = limit; }
        if (offset != null) { query['offset'] = offset; }

        return this.request<InlineResponse200>({
            path: '/v2/actions',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns all coin amounts of the given address at the specified timestamp or height, or at the latest process block if neither is provided. (Only one of timestamp or height can be specified, not both.)  This endpoint is enabled only if the midgard startup config allows it. 
     * Current balance for an address
     */
    getBalance = ({ address, timestamp, height }: GetBalanceRequest): Observable<Balance> => {
        throwIfNullOrUndefined(address, 'getBalance');

        const query: HttpQuery = {};

        if (timestamp != null) { query['timestamp'] = timestamp; }
        if (height != null) { query['height'] = height; }

        return this.request<Balance>({
            path: '/v2/balance/{address}'.replace('{address}', encodeURI(address)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns block height and timestamp for each churn.
     * Churns List
     */
    getChurns = (): Observable<Array<ChurnItem>> => {
        return this.request<Array<ChurnItem>>({
            path: '/v2/churns',
            method: 'GET',
        });
    };

    /**
     * Returns the asset and rune depths and price. The values report the state at the end of each interval.  History endpoint has two modes: * With Interval parameter it returns a series of time buckets. From and To dates will   be rounded to the Interval boundaries. * Without Interval parameter a single From..To search is performed with exact timestamps.   * Interval: possible values: 5min, hour, day, week, month, quarter, year. * count: [1..400]. Defines number of intervals. Don\'t provide if Interval is missing. * from/to: optional int, unix second.  Possible usages with interval. * last 10 days: `?interval=day&count=10` * last 10 days before to: `?interval=day&count=10&to=1608825600` * next 10 days after from: `?interval=day&count=10&from=1606780800` * Days between from and to. From defaults to start of chain, to defaults to now.   Only the first 400 intervals are returned:   `interval=day&from=1606780800&to=1608825600`  Pagination is possible with from&count and then using the returned meta.endTime as the From parameter of the next query.  Possible configurations without interval: * exact search for one time frame: `?from=1606780899&to=1608825600` * one time frame until now: `?from=1606780899` * from chain start until now: no query parameters 
     * Depth and Price History
     */
    getDepthHistory = ({ pool, interval, count, to, from }: GetDepthHistoryRequest): Observable<DepthHistory> => {
        throwIfNullOrUndefined(pool, 'getDepthHistory');

        const query: HttpQuery = {};

        if (interval != null) { query['interval'] = interval; }
        if (count != null) { query['count'] = count; }
        if (to != null) { query['to'] = to; }
        if (from != null) { query['from'] = from; }

        return this.request<DepthHistory>({
            path: '/v2/history/depths/{pool}'.replace('{pool}', encodeURI(pool)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns earnings data for the specified interval.  History endpoint has two modes: * With Interval parameter it returns a series of time buckets. From and To dates will   be rounded to the Interval boundaries. * Without Interval parameter a single From..To search is performed with exact timestamps.   * Interval: possible values: 5min, hour, day, week, month, quarter, year. * count: [1..400]. Defines number of intervals. Don\'t provide if Interval is missing. * from/to: optional int, unix second.  Possible usages with interval. * last 10 days: `?interval=day&count=10` * last 10 days before to: `?interval=day&count=10&to=1608825600` * next 10 days after from: `?interval=day&count=10&from=1606780800` * Days between from and to. From defaults to start of chain, to defaults to now.   Only the first 400 intervals are returned:   `interval=day&from=1606780800&to=1608825600`  Pagination is possible with from&count and then using the returned meta.endTime as the From parameter of the next query.  Possible configurations without interval: * exact search for one time frame: `?from=1606780899&to=1608825600` * one time frame until now: `?from=1606780899` * from chain start until now: no query parameters 
     * Earnings History
     */
    getEarningsHistory = ({ interval, count, to, from }: GetEarningsHistoryRequest): Observable<EarningsHistory> => {

        const query: HttpQuery = {};

        if (interval != null) { query['interval'] = interval; }
        if (count != null) { query['count'] = count; }
        if (to != null) { query['to'] = to; }
        if (from != null) { query['from'] = from; }

        return this.request<EarningsHistory>({
            path: '/v2/history/earnings',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns an object containing the health response of the API. Meaning of heights:  lastThorNode - Latest block as reported by ThorNode.  lastFetched - Latest block fetched from ThorNode.  lastCommitted - Latest block commited to the DB but not fully processed yet.  lastAggregated - Latest block fully processed and aggregated. 
     * Health Info
     */
    getHealth = (): Observable<Health> => {
        return this.request<Health>({
            path: '/v2/health',
            method: 'GET',
        });
    };

    /**
     * Returns withdrawals and deposits for given time interval. If pool is not specified returns for all pools  History endpoint has two modes: * With Interval parameter it returns a series of time buckets. From and To dates will   be rounded to the Interval boundaries. * Without Interval parameter a single From..To search is performed with exact timestamps.   * Interval: possible values: 5min, hour, day, week, month, quarter, year. * count: [1..400]. Defines number of intervals. Don\'t provide if Interval is missing. * from/to: optional int, unix second.  Possible usages with interval. * last 10 days: `?interval=day&count=10` * last 10 days before to: `?interval=day&count=10&to=1608825600` * next 10 days after from: `?interval=day&count=10&from=1606780800` * Days between from and to. From defaults to start of chain, to defaults to now.   Only the first 400 intervals are returned:   `interval=day&from=1606780800&to=1608825600`  Pagination is possible with from&count and then using the returned meta.endTime as the From parameter of the next query.  Possible configurations without interval: * exact search for one time frame: `?from=1606780899&to=1608825600` * one time frame until now: `?from=1606780899` * from chain start until now: no query parameters 
     * Liquidity Changes History
     */
    getLiquidityHistory = ({ pool, interval, count, to, from }: GetLiquidityHistoryRequest): Observable<LiquidityHistory> => {

        const query: HttpQuery = {};

        if (pool != null) { query['pool'] = pool; }
        if (interval != null) { query['interval'] = interval; }
        if (count != null) { query['count'] = count; }
        if (to != null) { query['to'] = to; }
        if (from != null) { query['from'] = from; }

        return this.request<LiquidityHistory>({
            path: '/v2/history/liquidity_changes',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns an array of statistics for all the liquidity providers associated with a given member address. 
     * Member Details
     */
    getMemberDetail = ({ address }: GetMemberDetailRequest): Observable<MemberDetails> => {
        throwIfNullOrUndefined(address, 'getMemberDetail');

        return this.request<MemberDetails>({
            path: '/v2/member/{address}'.replace('{address}', encodeURI(address)),
            method: 'GET',
        });
    };

    /**
     * Returns an array containing the addresses for all pool members. Addresses are only shown once. If there\'s both a RUNE address and an asset address for a member, only the RUNE address will be shown. 
     * Members List
     */
    getMembersAdresses = ({ pool }: GetMembersAdressesRequest): Observable<Array<string>> => {

        const query: HttpQuery = {};

        if (pool != null) { query['pool'] = pool; }

        return this.request<Array<string>>({
            path: '/v2/members',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns an object containing Network data
     * Network Data
     */
    getNetworkData = (): Observable<Network> => {
        return this.request<Network>({
            path: '/v2/network',
            method: 'GET',
        });
    };

    /**
     * Returns a list of Node public keys and adresses.
     * Nodes List
     */
    getNodes = (): Observable<Array<Node>> => {
        return this.request<Array<Node>>({
            path: '/v2/nodes',
            method: 'GET',
        });
    };

    /**
     * Returns details of the pool: depths, price, 24h volume, APY. 
     * Details of a Pool
     */
    getPool = ({ asset, period }: GetPoolRequest): Observable<PoolDetail> => {
        throwIfNullOrUndefined(asset, 'getPool');

        const query: HttpQuery = {};

        if (period != null) { query['period'] = period; }

        return this.request<PoolDetail>({
            path: '/v2/pool/{asset}'.replace('{asset}', encodeURI(asset)),
            method: 'GET',
            query,
        });
    };

    /**
     * Statistics about the pool. The description of the fields have pointers about the corresponding v2/history location. Visit the history endpoint for drilldowns. 
     * Pool Statistics
     */
    getPoolStats = ({ asset, period }: GetPoolStatsRequest): Observable<PoolStatsDetail> => {
        throwIfNullOrUndefined(asset, 'getPoolStats');

        const query: HttpQuery = {};

        if (period != null) { query['period'] = period; }

        return this.request<PoolStatsDetail>({
            path: '/v2/pool/{asset}/stats'.replace('{asset}', encodeURI(asset)),
            method: 'GET',
            query,
        });
    };

    /**
     * Returns an array containing details for a set of pools
     * Pools List
     */
    getPools = ({ status, period }: GetPoolsRequest): Observable<Array<PoolDetail>> => {

        const query: HttpQuery = {};

        if (status != null) { query['status'] = status; }
        if (period != null) { query['period'] = period; }

        return this.request<Array<PoolDetail>>({
            path: '/v2/pools',
            method: 'GET',
            query,
        });
    };

    /**
     * Constant values used by THORChain , some of the values can be overrided by mimir
     * Proxied THORChain Constants
     */
    getProxiedConstants = (): Observable<Constants> => {
        return this.request<Constants>({
            path: '/v2/thorchain/constants',
            method: 'GET',
        });
    };

    /**
     * Inbound addresses will return a list of address , one per chain. The address might change frequently if THORChain has multiple asgards. 
     * Proxied THORChain Inbound Addresses
     */
    getProxiedInboundAddresses = (): Observable<Array<InboundAddressesItem>> => {
        return this.request<Array<InboundAddressesItem>>({
            path: '/v2/thorchain/inbound_addresses',
            method: 'GET',
        });
    };

    /**
     * Retrieve lastest block infomation across all chains.
     * Proxied THORChain Lastblock
     */
    getProxiedLastblock = (): Observable<Array<LastblockItem>> => {
        return this.request<Array<LastblockItem>>({
            path: '/v2/thorchain/lastblock',
            method: 'GET',
        });
    };

    /**
     * Returns the proxied nodes endpoint from thornode
     * Proxied THORChain Nodes
     */
    getProxiedNodes = (): Observable<Array<ProxiedNode>> => {
        return this.request<Array<ProxiedNode>>({
            path: '/v2/thorchain/nodes',
            method: 'GET',
        });
    };

    /**
     * Returns the proxied queue endpoint from thornode
     * Proxied THORChain Queue
     */
    getProxiedQueue = (): Observable<Queue> => {
        return this.request<Queue>({
            path: '/v2/thorchain/queue',
            method: 'GET',
        });
    };

    /**
     * Returns an object containing global stats for all pools and all transactions
     * Global Stats
     */
    getStats = (): Observable<StatsData> => {
        return this.request<StatsData>({
            path: '/v2/stats',
            method: 'GET',
        });
    };

    /**
     * Returns swap count, volume, fees, slip in specified interval. If pool is not specified returns for all pools  History endpoint has two modes: * With Interval parameter it returns a series of time buckets. From and To dates will   be rounded to the Interval boundaries. * Without Interval parameter a single From..To search is performed with exact timestamps.   * Interval: possible values: 5min, hour, day, week, month, quarter, year. * count: [1..400]. Defines number of intervals. Don\'t provide if Interval is missing. * from/to: optional int, unix second.  Possible usages with interval. * last 10 days: `?interval=day&count=10` * last 10 days before to: `?interval=day&count=10&to=1608825600` * next 10 days after from: `?interval=day&count=10&from=1606780800` * Days between from and to. From defaults to start of chain, to defaults to now.   Only the first 400 intervals are returned:   `interval=day&from=1606780800&to=1608825600`  Pagination is possible with from&count and then using the returned meta.endTime as the From parameter of the next query.  Possible configurations without interval: * exact search for one time frame: `?from=1606780899&to=1608825600` * one time frame until now: `?from=1606780899` * from chain start until now: no query parameters 
     * Swaps History
     */
    getSwapHistory = ({ pool, interval, count, to, from }: GetSwapHistoryRequest): Observable<SwapHistory> => {

        const query: HttpQuery = {};

        if (pool != null) { query['pool'] = pool; }
        if (interval != null) { query['interval'] = interval; }
        if (count != null) { query['count'] = count; }
        if (to != null) { query['to'] = to; }
        if (from != null) { query['from'] = from; }

        return this.request<SwapHistory>({
            path: '/v2/history/swaps',
            method: 'GET',
            query,
        });
    };

    /**
     * Returns an array of chains and their addresses associated with the given THORName
     * THORName Details
     */
    getTHORNameDetail = ({ name }: GetTHORNameDetailRequest): Observable<THORNameDetails> => {
        throwIfNullOrUndefined(name, 'getTHORNameDetail');

        return this.request<THORNameDetails>({
            path: '/v2/thorname/lookup/{name}'.replace('{name}', encodeURI(name)),
            method: 'GET',
        });
    };

    /**
     * Returns an array of THORNames associated with the given address
     * Gives a list of THORNames by reverse lookup
     */
    getTHORNamesByAddress = ({ address }: GetTHORNamesByAddressRequest): Observable<Array<string>> => {
        throwIfNullOrUndefined(address, 'getTHORNamesByAddress');

        return this.request<Array<string>>({
            path: '/v2/thorname/rlookup/{address}'.replace('{address}', encodeURI(address)),
            method: 'GET',
        });
    };

    /**
     * Returns an array of THORNames owned by the address. The address is not necessarily an associated address for those thornames. 
     * THORName owner
     */
    getTHORNamesOwnerByAddress = ({ address }: GetTHORNamesOwnerByAddressRequest): Observable<Array<string>> => {
        throwIfNullOrUndefined(address, 'getTHORNamesOwnerByAddress');

        return this.request<Array<string>>({
            path: '/v2/thorname/owner/{address}'.replace('{address}', encodeURI(address)),
            method: 'GET',
        });
    };

    /**
     * Returns total pool depths, total bonds, and total value locked in specified interval.  Total Value Locked = Total Bonds + 2 * Total Pool Depths  History endpoint has two modes: * With Interval parameter it returns a series of time buckets. From and To dates will   be rounded to the Interval boundaries. * Without Interval parameter a single From..To search is performed with exact timestamps.  * Interval: possible values: 5min, hour, day, week, month, quarter, year. * count: [1..400]. Defines number of intervals. Don\'t provide if Interval is missing. * from/to: optional int, unix second.  Possible usages with interval. * last 10 days: `?interval=day&count=10` * last 10 days before to: `?interval=day&count=10&to=1608825600` * next 10 days after from: `?interval=day&count=10&from=1606780800` * Days between from and to. From defaults to start of chain, to defaults to now.   Only the first 400 intervals are returned:   `interval=day&from=1606780800&to=1608825600`  Pagination is possible with from&count and then using the returned meta.endTime as the From parameter of the next query.  Possible configurations without interval: * exact search for one time frame: `?from=1606780899&to=1608825600` * one time frame until now: `?from=1606780899` * from chain start until now: no query parameters 
     * Total Value Locked History
     */
    getTVLHistory = ({ interval, count, to, from }: GetTVLHistoryRequest): Observable<TVLHistory> => {

        const query: HttpQuery = {};

        if (interval != null) { query['interval'] = interval; }
        if (count != null) { query['count'] = count; }
        if (to != null) { query['to'] = to; }
        if (from != null) { query['from'] = from; }

        return this.request<TVLHistory>({
            path: '/v2/history/tvl',
            method: 'GET',
            query,
        });
    };

}

/**
 * @export
 * @enum {string}
 */
export enum GetDepthHistoryIntervalEnum {
    _5min = '5min',
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Quarter = 'quarter',
    Year = 'year'
}
/**
 * @export
 * @enum {string}
 */
export enum GetEarningsHistoryIntervalEnum {
    _5min = '5min',
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Quarter = 'quarter',
    Year = 'year'
}
/**
 * @export
 * @enum {string}
 */
export enum GetLiquidityHistoryIntervalEnum {
    _5min = '5min',
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Quarter = 'quarter',
    Year = 'year'
}
/**
 * @export
 * @enum {string}
 */
export enum GetPoolPeriodEnum {
    _1h = '1h',
    _24h = '24h',
    _7d = '7d',
    _30d = '30d',
    _90d = '90d',
    _100d = '100d',
    _180d = '180d',
    _365d = '365d',
    All = 'all'
}
/**
 * @export
 * @enum {string}
 */
export enum GetPoolStatsPeriodEnum {
    _1h = '1h',
    _24h = '24h',
    _7d = '7d',
    _30d = '30d',
    _90d = '90d',
    _100d = '100d',
    _180d = '180d',
    _365d = '365d',
    All = 'all'
}
/**
 * @export
 * @enum {string}
 */
export enum GetPoolsStatusEnum {
    Available = 'available',
    Staged = 'staged',
    Suspended = 'suspended'
}
/**
 * @export
 * @enum {string}
 */
export enum GetPoolsPeriodEnum {
    _1h = '1h',
    _24h = '24h',
    _7d = '7d',
    _30d = '30d',
    _90d = '90d',
    _100d = '100d',
    _180d = '180d',
    _365d = '365d',
    All = 'all'
}
/**
 * @export
 * @enum {string}
 */
export enum GetSwapHistoryIntervalEnum {
    _5min = '5min',
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Quarter = 'quarter',
    Year = 'year'
}
/**
 * @export
 * @enum {string}
 */
export enum GetTVLHistoryIntervalEnum {
    _5min = '5min',
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Quarter = 'quarter',
    Year = 'year'
}
