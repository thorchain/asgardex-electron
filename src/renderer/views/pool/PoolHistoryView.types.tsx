import { UseMidgardHistoryActions } from '../../hooks/useMidgardHistoryActions'

export type PoolHistoryActions = Pick<
  UseMidgardHistoryActions,
  'requestParams' | 'loadHistory' | 'historyPage' | 'prevHistoryPage' | 'setFilter' | 'setPage'
>
