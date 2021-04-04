import * as RD from '@devexperts/remote-data-ts'
import { Address, TxHash } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { InlineResponse200 } from '../../types/generated/midgard/models'
import { MAX_ITEMS_PER_PAGE } from '../const'
import { ErrorId } from '../wallet/types'
import { getRequestType, mapAction } from './poolActionsHistory.utils'
import { PoolActionsHistoryPageLD, TxType } from './types'

export type LoadActionsParams = {
  page: number
  addresses?: Address[]
  txid?: TxHash
  asset?: string
  type?: TxType | 'ALL'
  itemsPerPage?: number
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

  const { get$: requestParam$, set: setRequestParams, get: getCurrentRequestParams } = observableState<
    O.Option<LoadActionsParams>
  >(O.none)

  const getActions$ = ({
    itemsPerPage,
    page,
    type,
    addresses = [],
    ...params
  }: LoadActionsParams): PoolActionsHistoryPageLD =>
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
            limit: itemsPerPage || MAX_ITEMS_PER_PAGE,
            offset: (itemsPerPage || MAX_ITEMS_PER_PAGE) * page
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

  const resetActionsData = () => {
    setRequestParams(O.none)
  }
  const loadActionsHistory = (parameters: Partial<LoadActionsParams>) => {
    const newParams = FP.pipe(
      getCurrentRequestParams(),
      O.alt(() => O.some(DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS)),
      /**
       * Merge new parameters with a previous ones to have an opportunity
       * of partial updates of parameters
       */
      O.map((previousParams) => ({ ...previousParams, ...parameters }))
    )
    setRequestParams(newParams)
  }

  /**
   * !!! NOTE !!!
   * When using actions$ at any View do not forget
   * to reset parameters with resetActionsData on View
   * unmount to avoid any unwanted caching of requestParam$
   * values as it's a hot stream and will not be completed
   * after any unsubscription
   */
  const actions$: PoolActionsHistoryPageLD = FP.pipe(
    Rx.combineLatest([requestParam$, reloadActionsHistory$]),
    RxOp.switchMap(([parameters]) =>
      FP.pipe(
        parameters,
        O.fold(
          (): PoolActionsHistoryPageLD => Rx.of(RD.initial),
          (params) => getActions$(params)
        )
      )
    ),
    RxOp.shareReplay(1)
  )

  return {
    actions$,
    requestParam$,
    reloadActionsHistory,
    resetActionsData,
    loadActionsHistory
  }
}
