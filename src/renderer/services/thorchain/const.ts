import * as RD from '@devexperts/remote-data-ts'

import { InteractState } from './types'

export const INITIAL_INTERACT_STATE: InteractState = {
  step: 1,
  stepsTotal: 2,
  txRD: RD.initial
}
