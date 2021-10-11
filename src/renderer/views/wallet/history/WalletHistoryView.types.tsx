import { UseMidgardHistoryActions } from '../../../hooks/useMidgardHistoryActions'

export type WalletHistoryActions = Pick<
  UseMidgardHistoryActions,
  'requestParams' | 'loadHistory' | 'historyPage' | 'prevHistoryPage' | 'setFilter' | 'setAddress' | 'setPage'
>
