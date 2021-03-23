import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LiveData, liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { DefaultApi } from '../../types/generated/midgard/apis'
import { InlineResponse200 } from '../../types/generated/midgard/models'
import { MAX_ITEMS_PER_PAGE } from '../const'
import { ErrorId } from '../wallet/types'
import { HistoryActionsPageLD, Tx, TxType } from './types'

export type LoadActionsParams = {
  page: number
  address?: string
  txid?: string
  asset?: string
  type?: TxType | 'ALL'
}

export const DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS: LoadActionsParams = {
  page: 1
}

const getTxType = (apiString: string): TxType => {
  const type = apiString.toUpperCase()
  switch (type) {
    case 'DEPOSIT':
    case 'SWAP':
    case 'WITHDRAW':
    case 'UPGRADE':
    case 'REFUND':
      return type
    case 'DOUBLESWAP':
      return 'DOUBLE_SWAP'
    case 'ADDLIQUIDITY':
      return 'DEPOSIT'
  }
  return 'UNKNOWN'
}

const getRequestType = (type?: TxType | 'ALL'): string | undefined => {
  switch (type) {
    case 'DEPOSIT': {
      return 'stake'
    }
    case 'DOUBLE_SWAP': {
      return 'doubleSwap'
    }
    case 'SWAP':
    case 'WITHDRAW':
      // case 'REFUND':
      // case 'UPGRADE':
      return type.toLowerCase()
  }
  return
}

export const createActionsHistoryService = (
  byzantine$: LiveData<Error, string>,
  getMidgardDefaultApi: (basePath: string) => DefaultApi
) => {
  const midgardDefaultApi$ = FP.pipe(byzantine$, liveData.map(getMidgardDefaultApi), RxOp.shareReplay(1))

  const { stream$: reloadActionsHistory$, trigger: reloadActionsHistory } = triggerStream()

  const actions$ = ({ page, type, ...params }: LoadActionsParams): HistoryActionsPageLD =>
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
            offset: MAX_ITEMS_PER_PAGE * (page - 1)
          }),
          RxOp.catchError((): Rx.Observable<InlineResponse200> => Rx.of({ actions: [], count: '0' })),
          RxOp.map(RD.success),
          liveData.map(({ actions, count }) => ({
            actions: FP.pipe(
              actions,
              A.map((s) => FP.pipe(s.type, getTxType, (type) => ({ ...s, type }))),
              A.map((action) => {
                return {
                  ...action,
                  // type: 'DEPOSIT' as const,
                  // why devided by 1000?
                  date: new Date(Number(action.date) / 1000),
                  in: FP.pipe(
                    action.in,
                    A.map(
                      (tx): Tx => ({
                        ...tx,
                        values: FP.pipe(
                          tx.coins,
                          A.filterMap((coin) => {
                            const asset = assetFromString(coin.asset)
                            return asset ? O.some({ asset, amount: baseAmount(coin.amount) }) : O.none
                          })
                        )
                      })
                    )
                  ),
                  out: FP.pipe(
                    action.out,
                    A.map(
                      (tx): Tx => ({
                        ...tx,
                        values: FP.pipe(
                          tx.coins,
                          A.filterMap((coin) => {
                            const asset = assetFromString(coin.asset)
                            return asset ? O.some({ asset, amount: baseAmount(coin.amount) }) : O.none
                          })
                        )
                      })
                    )
                  )
                }
              })
            ),
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
