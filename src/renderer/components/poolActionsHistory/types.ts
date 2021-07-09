import * as O from 'fp-ts/Option'

import { OpenExplorerTxUrl } from '../../services/clients'
import { PoolActionsHistoryPage, PoolActionsHistoryPageRD, TxType } from '../../services/midgard/types'

export type Filter = TxType | 'ALL'

export type Props = {
  currentPage: number
  actionsPageRD: PoolActionsHistoryPageRD
  prevActionsPage?: O.Option<PoolActionsHistoryPage>
  openExplorerTxUrl: OpenExplorerTxUrl
  changePaginationHandler: (page: number) => void
  currentFilter: Filter
  setFilter: (filter: Filter) => void
  className?: string
  availableFilters: Filter[]
}
