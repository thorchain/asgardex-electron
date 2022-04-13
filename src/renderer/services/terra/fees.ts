import * as RD from '@devexperts/remote-data-ts'
import { FeeType, singleFee } from '@xchainjs/xchain-client'
import { FeeParams, TERRA_DECIMAL } from '@xchainjs/xchain-terra'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { FeesLD } from '../clients'
import { FeesService, Client$ } from './types'

export const createFeesService = (client$: Client$): FeesService => {
  const { get$: reloadFees$, set: reloadFees } = observableState<O.Option<FeeParams>>(O.none)

  const fees$ = (params: FeeParams): FeesLD => {
    return Rx.combineLatest([reloadFees$, client$]).pipe(
      RxOp.switchMap(([oReloadFeesParams, oClient]) => {
        const feeParams: FeeParams = FP.pipe(
          oReloadFeesParams,
          O.getOrElse(() => params)
        )

        return FP.pipe(
          oClient,
          O.fold(
            () => Rx.EMPTY,
            (client) =>
              Rx.from(client.getFees(feeParams)).pipe(
                RxOp.map(RD.success),
                RxOp.catchError((_) => Rx.of(RD.success(singleFee(FeeType.PerByte, baseAmount(0, TERRA_DECIMAL))))),
                RxOp.startWith(RD.pending)
              )
          )
        )
      }),
      RxOp.startWith(RD.pending)
    )
  }

  return {
    fees$,
    reloadFees
  }
}
