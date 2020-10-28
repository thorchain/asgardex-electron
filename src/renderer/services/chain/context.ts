import { isCrossChainStake$ } from './common'
import { reloadStakeFees, stakeFees$ } from './fees'

/**
 * Exports all functions and observables needed at UI level (provided by `ChainContext`)
 */
export { reloadStakeFees, stakeFees$, isCrossChainStake$ }
