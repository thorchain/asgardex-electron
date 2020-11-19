import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import { FeesLD } from '../clients/types'
import { FeesService } from './types'
import { Client$ } from './types'

// `TriggerStream` to reload `Fees`
const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

/**
 * Transaction fees
 */
const fees$: (client: Client$) => FeesLD = (client$) =>
  Rx.combineLatest([reloadFees$, client$]).pipe(
    switchMap(([_, oClient]) =>
      FP.pipe(
        // client and asset has to be available
        oClient,
        O.fold(
          () => Rx.EMPTY,
          (client) => Rx.from(client.getFees())
        )
      )
    ),
    map(RD.success),
    startWith(RD.initial),
    shareReplay(1)
  )

export const createFeesService = (client$: Client$): FeesService => ({
  reloadFees,
  fees$: fees$(client$)
})
