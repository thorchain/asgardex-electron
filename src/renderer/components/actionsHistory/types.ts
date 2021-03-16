import * as O from 'fp-ts/Option'

import { HistoryActionsPage, HistoryActionsPageRD } from '../../services/midgard/types'

export type Props = {
  actionsPageRD: HistoryActionsPageRD
  prevActionsPageRD?: O.Option<HistoryActionsPage>
  goToTx: (txHash: string) => void
  changePaginationHandler: (page: number) => void
  clickTxLinkHandler: (txHash: string) => void
}
