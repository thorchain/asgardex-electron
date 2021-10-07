import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { PoolActionsHistory } from '../../../components/poolActionsHistory'
import { DEFAULT_PAGE_SIZE } from '../../../components/poolActionsHistory/PoolActionsHistory.const'
import { Filter } from '../../../components/poolActionsHistory/types'
import { WalletPoolActionsHistoryHeader } from '../../../components/poolActionsHistory/WalletPoolActionsHistoryHeader'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { liveData } from '../../../helpers/rx/liveData'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { ENABLED_CHAINS } from '../../../services/const'
import { DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS } from '../../../services/midgard/poolActionsHistory'
import { PoolActionsHistoryPage } from '../../../services/midgard/types'

const DEFAULT_REQUEST_PARAMS = {
  ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS,
  itemsPerPage: DEFAULT_PAGE_SIZE
}

const HISTORY_FILTERS: Filter[] = ['ALL', 'SWITCH', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']

export const PoolActionsHistoryView: React.FC<{ className?: string }> = ({ className }) => {
  const { network } = useNetwork()

  const {
    service: {
      poolActionsHistory: { resetActionsData, requestParam$, loadActionsHistory, actions$ }
    }
  } = useMidgardContext()

  const { addressByChain$ } = useChainContext()

  const openExplorerTxUrl = useOpenExplorerTxUrl(O.some(THORChain))

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

  useEffect(() => {
    return () => {
      resetActionsData()
    }
    // Call reset callback only on component unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevActionsPage = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  const requestParams = useObservableState(
    FP.pipe(requestParam$, RxOp.map(O.getOrElse(() => DEFAULT_REQUEST_PARAMS))),
    DEFAULT_REQUEST_PARAMS
  )

  const [historyPage] = useObservableState(
    () =>
      FP.pipe(
        addresses$,
        RxOp.switchMap((addresses) => {
          loadActionsHistory({ ...DEFAULT_REQUEST_PARAMS, addresses })
          return actions$
        }),
        liveData.map((page) => {
          prevActionsPage.current = O.some(page)
          return page
        })
      ),
    RD.initial
  )

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

  const currentFilter = requestParams.type || 'ALL'

  const openViewblockUrlHandler = useCallback(async () => {
    // TODO (@asgdx-team): As part of #1811 - Get viewblock url using THORChain client
    // const addressUrl = client.getExplorerAddressUrl(address)
    // const addressUrl = url&txsType={type}
    console.log('currentFilter', currentFilter)
    return true
  }, [currentFilter])

  const headerContent = useMemo(
    () => (
      <WalletPoolActionsHistoryHeader
        network={network}
        availableFilters={HISTORY_FILTERS}
        currentFilter={currentFilter}
        setFilter={setFilter}
        openViewblockUrl={openViewblockUrlHandler}
        disabled={!RD.isSuccess(historyPage)}
      />
    ),
    [currentFilter, historyPage, network, openViewblockUrlHandler, setFilter]
  )

  return (
    <PoolActionsHistory
      headerContent={headerContent}
      className={className}
      currentPage={requestParams.page + 1}
      actionsPageRD={historyPage}
      prevActionsPage={prevActionsPage.current}
      openExplorerTxUrl={openExplorerTxUrl}
      changePaginationHandler={setCurrentPage}
    />
  )
}
