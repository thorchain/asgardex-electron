import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { WalletAddress, WalletAddresses } from '../../../../shared/wallet/types'
import { PoolActionsHistory } from '../../../components/poolActionsHistory'
import { DEFAULT_PAGE_SIZE } from '../../../components/poolActionsHistory/PoolActionsHistory.const'
import { Filter } from '../../../components/poolActionsHistory/types'
import { WalletPoolActionsHistoryHeader } from '../../../components/poolActionsHistory/WalletPoolActionsHistoryHeader'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqString } from '../../../helpers/fp/eq'
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

  const keystoreAddresses$ = useMemo<Rx.Observable<WalletAddresses>>(
    () =>
      FP.pipe(
        ENABLED_CHAINS,
        A.map(addressByChain$),
        (addresses) => Rx.combineLatest(addresses),
        RxOp.map(A.filterMap(FP.identity))
      ),
    [addressByChain$]
  )

  const { getLedgerAddress$ } = useWalletContext()

  const ledgerAddresses$ = useMemo(
    () =>
      FP.pipe(
        ENABLED_CHAINS,
        A.map((chain) => getLedgerAddress$(chain, network)),
        (addresses) => Rx.combineLatest(addresses),
        // Accept `successfully` added addresses only
        RxOp.map(A.filterMap(RD.toOption))
      ),
    [getLedgerAddress$, network]
  )

  // Combine addresses and update selected address
  const addresses$ = useMemo(
    () => FP.pipe(Rx.combineLatest([keystoreAddresses$, ledgerAddresses$]), RxOp.map(A.flatten)),
    [keystoreAddresses$, ledgerAddresses$]
  )

  // Combine addresses and update selected address
  const addresses = useObservableState(addresses$, [])

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
          FP.pipe(
            addresses,
            // Get first address by default
            A.head,
            O.map(({ address }) => loadActionsHistory({ ...DEFAULT_REQUEST_PARAMS, addresses: [address] }))
          )

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

  const setAddress = useCallback(
    ({ address }: WalletAddress) => {
      loadActionsHistory({
        // For every new address reset all parameters to defaults and with a custom filter
        ...DEFAULT_REQUEST_PARAMS,
        addresses: [address]
      })
    },
    [loadActionsHistory]
  )

  const currentFilter = useMemo(() => requestParams.type || 'ALL', [requestParams.type])

  const oSelectedWalletAddress: O.Option<WalletAddress> = useMemo(
    () =>
      FP.pipe(
        requestParams.addresses,
        O.fromNullable,
        O.chain(A.head),
        O.chain((paramAddress) =>
          FP.pipe(
            addresses,
            A.findFirst(({ address }) => eqString.equals(address, paramAddress))
          )
        )
      ),
    [addresses, requestParams.addresses]
  )

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
        addresses={addresses}
        selectedAddress={oSelectedWalletAddress}
        network={network}
        availableFilters={HISTORY_FILTERS}
        currentFilter={currentFilter}
        setFilter={setFilter}
        onWalletAddressChanged={setAddress}
        openViewblockUrl={openViewblockUrlHandler}
        disabled={!RD.isSuccess(historyPage)}
      />
    ),
    [
      addresses,
      currentFilter,
      historyPage,
      network,
      oSelectedWalletAddress,
      openViewblockUrlHandler,
      setAddress,
      setFilter
    ]
  )

  return (
    <>
      <PoolActionsHistory
        headerContent={headerContent}
        className={className}
        currentPage={requestParams.page + 1}
        actionsPageRD={historyPage}
        prevActionsPage={prevActionsPage.current}
        openExplorerTxUrl={openExplorerTxUrl}
        changePaginationHandler={setCurrentPage}
      />
    </>
  )
}
