import * as O from 'fp-ts/Option'

import { PoolActionsHistoryPage, PoolActionsHistoryPageRD, TxType } from '../../services/midgard/types'

export type Filter = TxType | 'ALL'

export type Props = {
  currentPage: number
  actionsPageRD: PoolActionsHistoryPageRD
  prevActionsPage?: O.Option<PoolActionsHistoryPage>
  goToTx: (txHash: string) => void
  changePaginationHandler: (page: number) => void
  clickTxLinkHandler: (txHash: string) => void
  currentFilter: Filter
  setFilter: (filter: Filter) => void
  className?: string
}
