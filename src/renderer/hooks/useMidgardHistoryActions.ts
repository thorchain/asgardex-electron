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
import { LoadActionsParams, ActionsPage, ActionsPageRD } from '../services/midgard/types'

export type UseMidgardHistoryActions = ReturnType<typeof useMidgardHistoryActions>

export const useMidgardHistoryActions = (itemsPerPage = 10) => {
  const {
    service: {
      actions: { getActions$ }
    }
  } = useMidgardContext()

  /**
   * Initial request params
   */
  const initialRequestParams: LoadActionsParams = useMemo(
    () => ({
      page: 0,
      itemsPerPage
    }),
    [itemsPerPage]
  )

  /**
   * Initial request params
   * It needs to be memorized to point to same `ObservableState`
   */
  const { requestParams$, setRequestParams, getRequestParams } = useMemo(() => {
    const { get$, set, get } = observableState<LoadActionsParams>(initialRequestParams)
    return {
      requestParams$: get$,
      setRequestParams: set,
      getRequestParams: get
    }
  }, [initialRequestParams])

  /**
   * Request params
   */
  const requestParams = useObservableState<LoadActionsParams>(requestParams$, initialRequestParams)

  /**
   * Loads history
   * Internally it just set new request params, which triggers a new request
   */
  const loadHistory = useCallback(
    (partialParams: Partial<LoadActionsParams>) => setRequestParams({ ...getRequestParams(), ...partialParams }),
    [getRequestParams, setRequestParams]
  )

  // Note: triggerStream needs to be memorized
  // If not, it will be re-created in every render, but `useObservableState<ActionsPageRD>` uses still the first created triggerStream
  // and will lost the stream (no trigger event anymore)
  const { reloadHistory$, reloadHistory } = useMemo(() => {
    const { stream$, trigger } = triggerStream()
    return { reloadHistory$: stream$, reloadHistory: trigger }
  }, [])

  /**
   * Previous history page
   */
  const prevHistoryPage = useRef<O.Option<ActionsPage>>(O.none)

  /**
   * Current history page
   */
  const [historyPage]: [ActionsPageRD, unknown] = useObservableState<ActionsPageRD>(
    () =>
      FP.pipe(
        Rx.combineLatest([
          requestParams$,
          reloadHistory$.pipe(
            RxOp.debounceTime(300) // debounce reload time
          )
        ]),
        RxOp.switchMap(([parameters]) => getActions$(parameters)),
        liveData.map((page) => {
          prevHistoryPage.current = O.some(page)
          return page
        })
      ),
    RD.initial
  )

  /**
   * Sets history page no. to get history data
   */
  const setPage = useCallback(
    (page: number) => {
      loadHistory({ page: page - 1 })
    },
    [loadHistory]
  )

  /**
   * Sets filter to get history data based on it
   */
  const setFilter = useCallback(
    (filter: Filter) => {
      loadHistory({
        page: 0,
        type: filter
      })
    },
    [loadHistory]
  )

  /**
   * Sets address to get its history data
   */
  const setAddress = useCallback(
    ({ address }: WalletAddress) => {
      loadHistory({
        page: 0,
        addresses: [address]
      })
    },
    [loadHistory]
  )

  const loading = RD.isPending(historyPage)

  return {
    loadHistory,
    reloadHistory,
    historyPage,
    loading,
    requestParams,
    prevHistoryPage: prevHistoryPage.current,
    setPage,
    setFilter,
    setAddress
  }
}
