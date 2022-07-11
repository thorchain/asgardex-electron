import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { TxHashRD } from '../../../../services/wallet/types'

export const sendTxTimerValue = (
  status: TxHashRD // Get timer value
) =>
  FP.pipe(
    status,
    RD.fold(
      () => 0,
      FP.flow(
        O.map(({ loaded }) => loaded),
        O.getOrElse(() => 0)
      ),
      () => 0,
      () => 100
    )
  )
