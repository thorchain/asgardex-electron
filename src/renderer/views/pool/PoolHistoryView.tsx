import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { PoolActionsHistory } from '../../components/poolActionsHistory'
import { DEFAULT_PAGE_SIZE } from '../../components/poolActionsHistory/PoolActionsHistory.const'
import { Filter } from '../../components/poolActionsHistory/types'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { liveData } from '../../helpers/rx/liveData'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { OpenExplorerTxUrl } from '../../services/clients'
import { DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, LoadActionsParams } from '../../services/midgard/poolActionsHistory'
import { PoolActionsHistoryPage, PoolActionsHistoryPageRD } from '../../services/midgard/types'

type Props = {
  poolAsset: Asset
  className?: string
}

const DEFAULT_REQUEST_PARAMS = {
  ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS,
  itemsPerPage: DEFAULT_PAGE_SIZE
}

const HISTORY_FILTERS: Filter[] = ['ALL', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']

export const PoolHistory: React.FC<Props> = ({ className, poolAsset }) => {
  const {
    service: {
      poolActionsHistory: { actions$, loadActionsHistory, requestParam$, resetActionsData }
    }
  } = useMidgardContext()

  const prevActionsPage = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  const requestParams = useObservableState(
    FP.pipe(requestParam$, RxOp.map(O.getOrElse((): LoadActionsParams => DEFAULT_REQUEST_PARAMS))),
    DEFAULT_REQUEST_PARAMS
  )

  const stringAsset = useMemo(() => assetToString(poolAsset), [poolAsset])

  useEffect(() => {
    loadActionsHistory({ ...DEFAULT_REQUEST_PARAMS, asset: stringAsset })
  }, [loadActionsHistory, stringAsset])

  const [historyPage] = useObservableState<PoolActionsHistoryPageRD>(
    () =>
      FP.pipe(
        actions$,
        liveData.map((page) => {
          prevActionsPage.current = O.some(page)
          return page
        })
      ),
    RD.initial
  )

  useEffect(() => {
    return () => {
      resetActionsData()
    }
    // Call reset callback only on component unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCurrentPage = useCallback(
    (page: number) => {
      loadActionsHistory({ itemsPerPage: DEFAULT_PAGE_SIZE, page: page - 1 })
    },
    [loadActionsHistory]
  )

  const setFilter = useCallback(
    (filter: Filter) => {
      loadActionsHistory({
        // For every new filter reset all parameters to defaults and with a custom filter
        ...DEFAULT_REQUEST_PARAMS,
        type: filter
      })
    },
    [loadActionsHistory]
  )

  const openRuneExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(THORChain)

  return (
    <PoolActionsHistory
      className={className}
      currentPage={requestParams.page + 1}
      actionsPageRD={historyPage}
      prevActionsPage={prevActionsPage.current}
      openExplorerTxUrl={openRuneExplorerTxUrl}
      changePaginationHandler={setCurrentPage}
      currentFilter={requestParams.type || 'ALL'}
      availableFilters={HISTORY_FILTERS}
      setFilter={setFilter}
    />
  )
}
