import { UseMidgardHistoryActions } from '../../hooks/useMidgardHistoryActions'

export type PoolHistoryActions = Pick<
  UseMidgardHistoryActions,
  'getRequestParams' | 'loadHistory' | 'historyPage' | 'prevActionsPage' | 'setFilter' | 'setPage'
>
