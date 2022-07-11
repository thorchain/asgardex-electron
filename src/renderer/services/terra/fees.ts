import * as RD from '@devexperts/remote-data-ts'
import { FeeParams } from '@xchainjs/xchain-terra'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { FeesLD } from '../clients'
import { FeesService, Client$, EstimatedFeeLD } from './types'

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
                RxOp.catchError((error) =>
                  Rx.of(RD.failure(Error(`Error to load fees (${error?.messagee ?? error.toString()})`)))
                )
              )
          )
        )
      }),
      RxOp.startWith(RD.pending)
    )
  }

  const estimatedFees$ = (params: FeeParams): EstimatedFeeLD => {
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
              Rx.from(client.getEstimatedFee(feeParams)).pipe(
                RxOp.map(RD.success),
                RxOp.catchError((error) =>
                  Rx.of(RD.failure(Error(`Error to load estimated fee (${error?.messagee ?? error.toString()})`)))
                )
              )
          )
        )
      }),
      RxOp.startWith(RD.pending)
    )
  }

  return {
    fees$,
    estimatedFees$,
    reloadFees
  }
}
