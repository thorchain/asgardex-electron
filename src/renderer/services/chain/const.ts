import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'

import { DepositState, SwapState } from './types'

export const MAX_SWAP_STEPS = 3

export const INITIAL_SWAP_STATE: SwapState = {
  step: 1,
  txRD: RD.initial,
  txHash: O.none
}

export const INITIAL_DEPOSIT_STATE: DepositState = {
  step: 1,
  txRD: RD.initial,
  txHash: O.none
}
