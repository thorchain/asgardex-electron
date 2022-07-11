import { PoolsMessages } from '../types'

const pools: PoolsMessages = {
  'pools.depth': 'Глубина',
  'pools.24hvol': 'объёмы за 24ч',
  'pools.apy': 'годовых',
  'pools.avgsize': 'ср. размер',
  'pools.avgfee': 'ср. комиссия',
  'pools.blocksleft': 'блоков осталось',
  'pools.trades': 'Сделок',
  'pools.pending': 'В ожидании',
  'pools.available': 'Доступны',
  'pools.pooled': 'заполнено',
  'pools.limit.info': 'Лимит протокола достигнут! {pooled} внесено в пулы, {bonded} заложено в нодах',
  'pools.incentivependulum.info': 'Маятник поощрения: {percentage}%',
  'pools.incentivependulum.tooltip': '{pooled} внесено в пулы, {bonded} заложено в нодах',
  'pools.incentivependulum.error': 'Ошибка при загрузке данных маятника поощрения'
}

export default pools
