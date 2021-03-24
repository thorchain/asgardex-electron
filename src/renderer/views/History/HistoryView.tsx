import React, { useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { ActionsHistory } from '../../components/actionsHistory'
import { Filter } from '../../components/actionsHistory/types'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { liveData } from '../../helpers/rx/liveData'
import { DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, LoadActionsParams } from '../../services/midgard/actionsHistory'
import { HistoryActionsPage, HistoryActionsPageRD } from '../../services/midgard/types'
import * as Styled from './HistoryView.styles'

export const HistoryView: React.FC = () => {
  const {
    service: { historyActions }
  } = useMidgardContext()

  const { getExplorerTxUrl$ } = useThorchainContext()

  const prevActionsPage = useRef<O.Option<HistoryActionsPage>>(O.none)

  const requestParams = useRef(DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS)

  const [historyPage, setHistoryPageParams] = useObservableState<HistoryActionsPageRD, Partial<LoadActionsParams>>(
    (params$) =>
      FP.pipe(
        params$,
        RxOp.startWith(DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS),
        RxOp.map((params) => {
          const res = { ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, ...params }
          requestParams.current = res
          return res
        }),
        RxOp.switchMap(historyActions.actions$),
        liveData.map((page) => {
          prevActionsPage.current = O.some(page)
          return page
        })
      ),
    RD.initial
  )

  const setCurrentPage = useCallback(
    (page: number) => {
      setHistoryPageParams({ page })
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
    <>
      <Styled.BackLink />
      <ActionsHistory
        currentPage={requestParams.current.page}
        actionsPageRD={historyPage}
        prevActionsPage={prevActionsPage.current}
        goToTx={goToTx}
        changePaginationHandler={setCurrentPage}
        clickTxLinkHandler={goToTx}
        currentFilter={requestParams.current.type || 'ALL'}
        setFilter={setFilter}
        reload={historyActions.reloadActionsHistory}
      />
    </>
  )
}
