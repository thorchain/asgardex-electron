import * as RD from '@devexperts/remote-data-ts'
import { FeeParams } from '@xchainjs/xchain-terra'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { observableState } from '../../helpers/stateHelper'
import { FeesLD } from '../clients'
import { FeesService, Client$ } from './types'

export const createFeesService = (client$: Client$): FeesService => {
  const { get$: reloadFees$, set: reloadFees } = observableState<O.Option<FeeParams>>(O.none)

  const fees$ = (params?: FeeParams): FeesLD =>
    Rx.iif(
      () => !params,
      // Rx.of(RD.success(singleFee(FeeType.PerByte, baseAmount(0, TERRA_DECIMAL)))),
      Rx.of(RD.initial),
      Rx.combineLatest([reloadFees$, client$]).pipe(
        RxOp.switchMap(([oReloadFeesParams, oClient]) =>
          FP.pipe(
            sequenceTOption(oClient, oReloadFeesParams),
            O.fold(
              () => Rx.EMPTY,
              ([client, reloadFeesParams]) => Rx.from(client.getFees(reloadFeesParams || params))
            )
          )
        ),
        RxOp.map(RD.success),
        RxOp.startWith(RD.pending)
      )
    )

  return {
    fees$,
    reloadFees
  }
}
