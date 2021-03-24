import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LiveData, liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { InlineResponse200 } from '../../types/generated/midgard/models'
import { MAX_ITEMS_PER_PAGE } from '../const'
import { ErrorId } from '../wallet/types'
import { getRequestType, mapAction } from './poolActionsHistory.utils'
import { PoolActionsHistoryPageLD, TxType } from './types'

export type LoadActionsParams = {
  page: number
  address?: Address
  txid?: TxHash
  asset?: string
  type?: TxType | 'ALL'
}

export const DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS: LoadActionsParams = {
  page: 0
}

export const createPoolActionsHistoryService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
) => {
  const midgardDefaultApi$ = FP.pipe(byzantine$, liveData.map(getMidgardDefaultApi), RxOp.shareReplay(1))

  const { stream$: reloadActionsHistory$, trigger: reloadActionsHistory } = triggerStream()

  const actions$ = ({ page, type, ...params }: LoadActionsParams): PoolActionsHistoryPageLD =>
    FP.pipe(
      Rx.combineLatest([midgardDefaultApi$, reloadActionsHistory$]),
      RxOp.map(([api]) => api),
      liveData.mapLeft(() => ({
        errorId: ErrorId.GET_ACTIONS,
        msg: 'API is not available'
      })),
      liveData.chain((api) =>
        FP.pipe(
          api.getActions({
            ...params,
            type: getRequestType(type),
            limit: MAX_ITEMS_PER_PAGE,
            offset: MAX_ITEMS_PER_PAGE * page
          }),
          RxOp.catchError((): Rx.Observable<InlineResponse200> => Rx.of({ actions: [], count: '0' })),
          RxOp.map(RD.success),
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
    actions$,
    reloadActionsHistory
  }
}
