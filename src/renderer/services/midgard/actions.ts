import * as RD from '@devexperts/remote-data-ts'
import { DefaultApi } from '@xchainjs/xchain-midgard'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { liveData } from '../../helpers/rx/liveData'
import { ErrorId } from '../wallet/types'
import { getRequestType, mapAction } from './action.utils'
import { LoadActionsParams, ActionsPageLD, MidgardUrlLD } from './types'

export const createActionsService = (
  midgardUrl$: MidgardUrlLD,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
) => {
  const midgardDefaultApi$ = FP.pipe(midgardUrl$, liveData.map(getMidgardDefaultApi), RxOp.shareReplay(1))

  const getActions$ = ({ itemsPerPage, page, type, addresses = [], ...params }: LoadActionsParams): ActionsPageLD =>
    FP.pipe(
      midgardDefaultApi$,
      liveData.mapLeft(() => ({
        errorId: ErrorId.GET_ACTIONS,
        msg: 'API is not available'
      })),
      liveData.chain((api) =>
        FP.pipe(
          api.getActions({
            ...params,
            address: addresses ? addresses.join(',') : undefined,
            type: getRequestType(type),
            limit: itemsPerPage,
            offset: itemsPerPage * page
          }),
          RxOp.catchError((): Rx.Observable<InlineResponse200> => Rx.of({ actions: [], count: '0' })),
          RxOp.switchMap((response) => Rx.of(RD.success(response))),
          liveData.map(({ actions, count }) => ({
            actions: FP.pipe(actions, A.map(mapAction)),
            total: parseInt(count, 10)
          })),
          liveData.mapLeft(() => ({
            errorId: ErrorId.GET_ACTIONS,
            msg: 'Error while getting a history'
          })),
          RxOp.startWith(RD.pending),
          RxOp.catchError((e) =>
            Rx.of(
              RD.failure({
                errorId: ErrorId.GET_ACTIONS,
                msg: e
              })
            )
          )
        )
      )
    )

  return {
    getActions$
  }
}
