import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, THORChain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { PoolActionsHistory } from '../../components/poolActionsHistory'
import { PoolActionsHistoryFilter } from '../../components/poolActionsHistory/PoolActionsHistoryFilter'
import { Filter } from '../../components/poolActionsHistory/types'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { OpenExplorerTxUrl } from '../../services/clients'
import { PoolHistoryActions } from './PoolHistoryView.types'

type Props = {
  poolAsset: Asset
  historyActions: PoolHistoryActions
  className?: string
}

const HISTORY_FILTERS: Filter[] = ['ALL', 'DEPOSIT', 'SWAP', 'WITHDRAW', 'DONATE', 'REFUND']

export const PoolHistoryView: React.FC<Props> = ({ className, poolAsset, historyActions }) => {
  const { loadHistory, getRequestParams, historyPage, prevActionsPage, setFilter, setPage } = historyActions

  const stringAsset = useMemo(() => assetToString(poolAsset), [poolAsset])

  useEffect(() => {
    loadHistory({ asset: stringAsset })
  }, [loadHistory, stringAsset])

  const currentFilter = getRequestParams().type || 'ALL'

  const openRuneExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(O.some(THORChain))

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
      currentPage={getRequestParams().page + 1}
      historyPageRD={historyPage}
      prevHistoryPage={prevActionsPage}
      openExplorerTxUrl={openRuneExplorerTxUrl}
      changePaginationHandler={setPage}
    />
  )
}
