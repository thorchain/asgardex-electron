import React, { useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { PoolActionsHistory } from '../../components/poolActionsHistory'
import { Filter } from '../../components/poolActionsHistory/types'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { liveData } from '../../helpers/rx/liveData'
import { DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, LoadActionsParams } from '../../services/midgard/poolActionsHistory'
import { PoolActionsHistoryPage, PoolActionsHistoryPageRD } from '../../services/midgard/types'

type Props = {
  poolAsset: Asset
  className?: string
}

const DEFAULT_REQUEST_PARAMS = {
  ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS,
  itemsPerPage: 5
}

export const PoolHistory: React.FC<Props> = ({ className, poolAsset }) => {
  const {
    service: { poolActionsHistory }
  } = useMidgardContext()

  const { getExplorerTxUrl$ } = useThorchainContext()

  const prevActionsPage = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  const requestParams = useRef(DEFAULT_REQUEST_PARAMS)

  /**
   * setHistoryPageParams receives Partial parameters to have an opportunity to
   * change request parameters only by small parts (not all in one). e.g setCurrentPage.
   * To store previously chosen request parameters that should not be changed `requestParams` ref is used.
   */
  const [historyPage, setHistoryPageParams] = useObservableState<PoolActionsHistoryPageRD, Partial<LoadActionsParams>>(
    (params$) =>
      FP.pipe(
        params$,
        RxOp.startWith(DEFAULT_REQUEST_PARAMS),
        RxOp.map((params) => {
          const res = {
            // Merge previously saved request parameters with a new Partial parameters
            ...requestParams.current,
            asset: assetToString(poolAsset),
            ...params
          }
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
        // For every new filter reset all parameters to default and pass a filter
        ...DEFAULT_REQUEST_PARAMS,
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
      className={className}
      currentPage={requestParams.current.page + 1}
      actionsPageRD={historyPage}
      prevActionsPage={prevActionsPage.current}
      goToTx={goToTx}
      changePaginationHandler={setCurrentPage}
      currentFilter={requestParams.current.type || 'ALL'}
      setFilter={setFilter}
    />
  )
}
