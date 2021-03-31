import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { PoolActionsHistory } from '../../../components/poolActionsHistory'
import { Filter } from '../../../components/poolActionsHistory/types'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { liveData } from '../../../helpers/rx/liveData'
import { ENABLED_CHAINS } from '../../../services/const'
import { DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, LoadActionsParams } from '../../../services/midgard/poolActionsHistory'
import { PoolActionsHistoryPage, PoolActionsHistoryPageRD } from '../../../services/midgard/types'

export const PoolActionsHistoryView: React.FC = () => {
  const {
    service: { poolActionsHistory }
  } = useMidgardContext()

  const { addressByChain$ } = useChainContext()

  const { getExplorerTxUrl$ } = useThorchainContext()

  const addresses$ = useMemo<Rx.Observable<Address[]>>(
    () =>
      FP.pipe(
        ENABLED_CHAINS,
        A.map(addressByChain$),
        (addresses) => Rx.combineLatest(addresses),
        RxOp.map(A.filterMap(FP.identity))
      ),
    [addressByChain$]
  )

  const prevActionsPage = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  const requestParams = useRef(DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS)

  const [historyPage, setHistoryPageParams] = useObservableState<PoolActionsHistoryPageRD, Partial<LoadActionsParams>>(
    (params$) =>
      FP.pipe(
        params$,
        RxOp.startWith(DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS),
        RxOp.switchMap((params) =>
          FP.pipe(
            addresses$,
            RxOp.map((addresses) => ({ ...params, addresses }))
          )
        ),
        RxOp.map((params) => {
          const res = { ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, ...params }
          requestParams.current = res
          return res
        }),
        RxOp.switchMap(poolActionsHistory.actions$),
        liveData.map((page) => {
          prevActionsPage.current = O.some(page)
          return page
        })
      ),
    RD.initial
  )

  const setCurrentPage = useCallback(
    (page: number) => {
      setHistoryPageParams({ page: page - 1 })
    },
    [setHistoryPageParams]
  )

  const setFilter = useCallback(
    (filter: Filter) => {
      setHistoryPageParams({
        ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS,
        type: filter
      })
    },
    [setHistoryPageParams]
  )

  const oExplorerUrl = useObservableState(getExplorerTxUrl$, O.none)

  const goToTx = useCallback(
    (txId: string) => {
      FP.pipe(
        oExplorerUrl,
        /**
         * todo @asgardexTeam use appropriate independent method from xchain-thorchain
         * after https://github.com/xchainjs/xchainjs-lib/issues/287 is resolved
         */
        O.alt(() => O.some((txId: string) => `https://testnet.thorchain.net/#/txs/${txId}`)),
        O.ap(O.some(txId)),
        O.map(window.apiUrl.openExternal)
      )
    },
    [oExplorerUrl]
  )

  return (
    <PoolActionsHistory
      currentPage={requestParams.current.page + 1}
      actionsPageRD={historyPage}
      prevActionsPage={prevActionsPage.current}
      goToTx={goToTx}
      changePaginationHandler={setCurrentPage}
      clickTxLinkHandler={goToTx}
      currentFilter={requestParams.current.type || 'ALL'}
      setFilter={setFilter}
      reload={poolActionsHistory.reloadActionsHistory}
    />
  )
}
