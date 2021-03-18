import * as O from 'fp-ts/Option'

import { HistoryActionsPage, HistoryActionsPageRD, TxType } from '../../services/midgard/types'

export type Filter = TxType | 'ALL'

export type Props = {
  currentPage: number
  actionsPageRD: HistoryActionsPageRD
  prevActionsPage?: O.Option<HistoryActionsPage>
  goToTx: (txHash: string) => void
  changePaginationHandler: (page: number) => void
  clickTxLinkHandler: (txHash: string) => void
  currentFilter: Filter
  setFilter: (filter: Filter) => void
  reload: () => void
  className?: string
}
