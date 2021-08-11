import * as RD from '@devexperts/remote-data-ts'

import { InteractState, MimirHalt } from './types'

export const INITIAL_INTERACT_STATE: InteractState = {
  step: 1,
  stepsTotal: 2,
  txRD: RD.initial
}

export const DEFAULT_MIMIR_HALT: MimirHalt = {
  haltTrading: false,
  haltThorChain: false,
  haltEthTrading: false,
  haltEthChain: false
}
