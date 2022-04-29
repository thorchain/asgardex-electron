import { UseMidgardHistoryActions } from '../../hooks/useMidgardHistoryActions'

export type PoolHistoryActions = Pick<
  UseMidgardHistoryActions,
  'requestParams' | 'loadHistory' | 'reloadHistory' | 'historyPage' | 'prevHistoryPage' | 'setFilter' | 'setPage'
>
