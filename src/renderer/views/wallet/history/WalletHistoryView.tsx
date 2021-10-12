import React, { useCallback, useMemo } from 'react'

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
import { Filter } from '../../../components/poolActionsHistory/types'
import { WalletPoolActionsHistoryHeader } from '../../../components/poolActionsHistory/WalletPoolActionsHistoryHeader'
import { useChainContext } from '../../../contexts/ChainContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { eqString } from '../../../helpers/fp/eq'
import { ordWalletAddressByChain } from '../../../helpers/fp/ord'
import { useNetwork } from '../../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { ENABLED_CHAINS } from '../../../services/const'
import { WalletHistoryActions } from './WalletHistoryView.types'

const HISTORY_FILTERS: Filter[] = ['ALL', 'SWITCH', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']

export type Props = {
  className?: string
  historyActions: WalletHistoryActions
}
export const WalletHistoryView: React.FC<Props> = ({ className, historyActions }) => {
  const { network } = useNetwork()

  const { addressByChain$ } = useChainContext()

  const { requestParams, loadHistory, historyPage, prevHistoryPage, setFilter, setAddress, setPage } = historyActions

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

  const addresses$ = useMemo(
    () =>
      FP.pipe(
        Rx.combineLatest([keystoreAddresses$, ledgerAddresses$]),
        RxOp.map(A.flatten),
        RxOp.map(A.sort(ordWalletAddressByChain)),
        RxOp.switchMap((addresses) => {
          FP.pipe(
            addresses,
            // Get first address by default
            A.head,
            O.map(({ address }) => loadHistory({ addresses: [address] }))
          )
          return Rx.of(addresses)
        })
      ),
    [keystoreAddresses$, ledgerAddresses$, loadHistory]
  )

  const addresses = useObservableState(addresses$, [])

  const currentFilter = useMemo(() => requestParams.type || 'ALL', [requestParams])

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
    [addresses, requestParams]
  )

  const openViewblockUrlHandler = useCallback(async () => {
    // TODO (@asgdx-team): As part of #1811 - Get viewblock url using THORChain client
    // const addressUrl = client.getExplorerAddressUrl(address)
    // const addressUrl = url&txsType={type}
    return true
  }, [])

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
        historyPageRD={historyPage}
        prevHistoryPage={prevHistoryPage}
        openExplorerTxUrl={openExplorerTxUrl}
        changePaginationHandler={setPage}
      />
    </>
  )
}
