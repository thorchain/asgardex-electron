import React, { useEffect, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { XChainClient, TxHash } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-thorchain'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

import { toClientNetwork } from '../../../shared/utils/client'
import { PoolActionsHistory } from '../../components/poolActionsHistory'
import { PoolActionsHistoryFilter } from '../../components/poolActionsHistory/PoolActionsHistoryFilter'
import { Filter } from '../../components/poolActionsHistory/types'
import { useNetwork } from '../../hooks/useNetwork'
import { openExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { OpenExplorerTxUrl } from '../../services/clients'
import { PoolHistoryActions } from './PoolHistoryView.types'

type Props = {
  poolAsset: Asset
  historyActions: PoolHistoryActions
  className?: string
}

const HISTORY_FILTERS: Filter[] = ['ALL', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']

export const PoolHistoryView: React.FC<Props> = ({ className, poolAsset, historyActions }) => {
  const { loadHistory, requestParams, historyPage, prevHistoryPage, setFilter, setPage } = historyActions

  const stringAsset = useMemo(() => assetToString(poolAsset), [poolAsset])

  const { network } = useNetwork()

  useEffect(() => {
    loadHistory({ asset: stringAsset })
  }, [loadHistory, stringAsset])

  const currentFilter = requestParams.type || 'ALL'

  const thorChainClient: O.Option<XChainClient> = useMemo(
    () => FP.pipe(O.tryCatch(() => new Client({ network: toClientNetwork(network) }))),
    [network]
  )

  useEffect(() => {
    // clean up client
    return () => {
      FP.pipe(
        thorChainClient,
        O.map((client) => client.purgeClient())
      )
    }
  }, [network, thorChainClient])

  const openExplorerTxUrlHandler: OpenExplorerTxUrl = useCallback(
    (txHash: TxHash) => openExplorerTxUrl(thorChainClient, txHash),
    [thorChainClient]
  )

  const headerContent = useMemo(
    () => (
      <PoolActionsHistoryFilter
        availableFilters={HISTORY_FILTERS}
        currentFilter={currentFilter}
        onFilterChanged={setFilter}
        disabled={!RD.isSuccess(historyPage)}
      />
    ),
    [currentFilter, historyPage, setFilter]
  )

  return (
    <PoolActionsHistory
      className={className}
      headerContent={headerContent}
      currentPage={requestParams.page + 1}
      historyPageRD={historyPage}
      prevHistoryPage={prevHistoryPage}
      openExplorerTxUrl={openExplorerTxUrlHandler}
      changePaginationHandler={setPage}
    />
  )
}
