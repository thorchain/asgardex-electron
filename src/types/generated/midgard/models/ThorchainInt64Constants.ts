// tslint:disable
/**
 * Midgard Public API
 * The Midgard Public API queries THORChain and any chains linked via the Bifröst and prepares information about the network to be readily available for public users. The API parses transaction event data from THORChain and stores them in a time-series database to make time-dependent queries easy. Midgard does not hold critical information. To interact with BEPSwap and Asgardex, users should query THORChain directly.
 *
 * The version of the OpenAPI document: 1.0.0-oas3
 * Contact: devs@thorchain.org
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * @export
 * @interface ThorchainInt64Constants
 */
export interface ThorchainInt64Constants {
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    BadValidatorRate?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    BlocksPerYear?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    DesireValidatorSet?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    DoubleSignMaxAge?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    EmissionCurve?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    FailKeySignSlashPoints?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    FailKeygenSlashPoints?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    FundMigrationInterval?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    JailTimeKeygen?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    JailTimeKeysign?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    LackOfObservationPenalty?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    MinimumBondInRune?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    MinimumNodesForBFT?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    MinimumNodesForYggdrasil?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    NewPoolCycle?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    ObserveSlashPoints?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    OldValidatorRate?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    RotatePerBlockHeight?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    RotateRetryBlocks?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    SigningTransactionPeriod?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    StakeLockUpBlocks?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    TransactionFee?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    ValidatorRotateInNumBeforeFull?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    ValidatorRotateNumAfterFull?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    ValidatorRotateOutNumBeforeFull?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    WhiteListGasAsset?: number;
    /**
     * @type {number}
     * @memberof ThorchainInt64Constants
     */
    YggFundLimit?: number;
}
