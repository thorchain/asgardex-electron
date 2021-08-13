import * as RD from '@devexperts/remote-data-ts'

import { InteractState, MimirHalt } from './types'

export const INITIAL_INTERACT_STATE: InteractState = {
  step: 1,
  stepsTotal: 2,
  txRD: RD.initial
}

export const DEFAULT_MIMIR_HALT: MimirHalt = {
  haltThorChain: false,
  haltTrading: false,
  haltEthTrading: false,
  haltBtcChain: false,
  haltEthChain: false,
  haltBchChain: false,
  haltLtcChain: false,
  haltBnbChain: false
}
