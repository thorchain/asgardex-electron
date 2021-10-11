import { UseMidgardHistoryActions } from '../../../hooks/useMidgardHistoryActions'

export type WalletHistoryActions = Pick<
  UseMidgardHistoryActions,
  'getRequestParams' | 'loadHistory' | 'historyPage' | 'prevActionsPage' | 'setFilter' | 'setAddress' | 'setPage'
>
