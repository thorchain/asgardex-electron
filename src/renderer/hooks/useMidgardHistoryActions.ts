import { useRef, useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { WalletAddress } from '../../shared/wallet/types'
import { Filter } from '../components/poolActionsHistory/types'
import { useMidgardContext } from '../contexts/MidgardContext'
import { liveData } from '../helpers/rx/liveData'
import { observableState, triggerStream } from '../helpers/stateHelper'
import { LoadActionsParams, ActionsPageRD, ActionsPage } from '../services/midgard/types'

export type UseMidgardHistoryActions = ReturnType<typeof useMidgardHistoryActions>

export const useMidgardHistoryActions = (itemsPerPage = 10) => {
  const {
    service: {
      actions: { getActions$ }
    }
  } = useMidgardContext()

  const DEFAULT_REQUEST_PARAMS: LoadActionsParams = useMemo(
    () => ({
      page: 0,
      itemsPerPage
    }),
    [itemsPerPage]
  )

  const { requestParams$, setRequestParams, getRequestParams } = useMemo(() => {
    const { get$, set, get } = observableState<LoadActionsParams>(DEFAULT_REQUEST_PARAMS)

    return { requestParams$: get$, setRequestParams: set, getRequestParams: get }
  }, [DEFAULT_REQUEST_PARAMS])

  const loadHistory = useCallback(
    (partialParams: Partial<LoadActionsParams>) => {
      const params = FP.pipe(
        getRequestParams(),
        // Merge new (partial) params with previous params
        (prevParams) => ({ ...prevParams, ...partialParams })
      )

      setRequestParams(params)
    },
    [getRequestParams, setRequestParams]
  )

  const { reloadHistory$, reloadHistory } = useMemo(() => {
    const { stream$, trigger } = triggerStream()
    return { reloadHistory$: stream$, reloadHistory: trigger }
  }, [])

  const prevActionsPage = useRef<O.Option<ActionsPage>>(O.none)

  const [historyPage]: [ActionsPageRD, unknown] = useObservableState<ActionsPageRD>(
    () =>
      FP.pipe(
        Rx.combineLatest([requestParams$, reloadHistory$]),
        RxOp.switchMap(([parameters]) => FP.pipe(parameters, getActions$)),
        liveData.map((page) => {
          prevActionsPage.current = O.some(page)
          return page
        })
      ),
    RD.initial
  )

  const setPage = useCallback(
    (page: number) => {
      loadHistory({ page: page - 1 })
    },
    [loadHistory]
  )

  const setFilter = useCallback(
    (filter: Filter) => {
      loadHistory({
        page: 0,
        type: filter
      })
    },
    [loadHistory]
  )

  const setAddress = useCallback(
    ({ address }: WalletAddress) => {
      loadHistory({
        page: 0,
        addresses: [address]
      })
    },
    [loadHistory]
  )

  return {
    loadHistory,
    historyPage,
    getRequestParams,
    prevActionsPage: prevActionsPage.current,
    reloadHistory,
    setPage,
    setFilter,
    setAddress
  }
}
