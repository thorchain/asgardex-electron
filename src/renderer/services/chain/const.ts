import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'

import { SwapState } from './types'

export const INITIAL_SWAP_TX_STATE: SwapState = {
  startTime: O.none,
  txRD: RD.initial,
  txHash: O.none
}
