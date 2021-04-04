import React, { useCallback, useEffect, useMemo, useRef } from 'react'

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
import { DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS } from '../../../services/midgard/poolActionsHistory'
import { PoolActionsHistoryPage } from '../../../services/midgard/types'

export const PoolActionsHistoryView: React.FC<{ className?: string }> = ({ className }) => {
  const {
    service: {
      poolActionsHistory: { resetActionsData, requestParam$, loadActionsHistory, actions$ }
    }
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

  useEffect(() => {
    return () => {
      resetActionsData()
    }
    // Call reset callback only on component unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevActionsPage = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  const requestParams = useObservableState(
    FP.pipe(requestParam$, RxOp.map(O.getOrElse(() => DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS))),
    DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS
  )

  const [historyPage] = useObservableState(
    () =>
      FP.pipe(
        addresses$,
        RxOp.switchMap((addresses) => {
          loadActionsHistory({ ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS, addresses })
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
      loadActionsHistory({ page: page - 1 })
    },
    [loadActionsHistory]
  )

  const setFilter = useCallback(
    (filter: Filter) => {
      loadActionsHistory({
        // For every new filter reset all parameters to defaults and with a custom filter
        ...DEFAULT_ACTIONS_HISTORY_REQUEST_PARAMS,
        type: filter
      })
    },
    [loadActionsHistory]
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
      currentPage={requestParams.page + 1}
      actionsPageRD={historyPage}
      prevActionsPage={prevActionsPage.current}
      goToTx={goToTx}
      changePaginationHandler={setCurrentPage}
      currentFilter={requestParams.type || 'ALL'}
      setFilter={setFilter}
    />
  )
}
