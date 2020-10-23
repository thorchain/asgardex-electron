import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount } from '@thorchain/asgardex-util'

import { LiveData } from '../../helpers/rx/liveData'

export type LoadFeesHandler = () => void

export type FeeRD = RD.RemoteData<Error, BaseAmount>
export type FeeLD = LiveData<Error, BaseAmount>

/**
 * Stake fees
 *
 * base: Fee for "base-chain" pool (base chain is the chain where RUNE is running)
 * cross: Fee for "cross-chain" pool
 */
export type StakeFees = { base: BaseAmount; pool: BaseAmount }
export type StakeFeesRD = RD.RemoteData<Error, StakeFees>
export type StakeFeesLD = LiveData<Error, StakeFees>
