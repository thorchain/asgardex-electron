import { PoolsMessages } from '../types'

const pools: PoolsMessages = {
  'pools.depth': 'Depth',
  'pools.24hvol': '24h volume',
  'pools.apy': 'APY',
  'pools.avgsize': 'avg size',
  'pools.avgfee': 'avg fee',
  'pools.blocksleft': 'blocks left',
  'pools.trades': 'Trades',
  'pools.pending': 'Pending',
  'pools.available': 'Available',
  'pools.pooled': 'pooled',
  'pools.limit.info': 'Protocol limit reached! {pooled} pooled in pools, {bonded} bonded in nodes',
  'pools.incentivependulum.info': 'Incentive Pendulum: {percentage}%',
  'pools.incentivependulum.tooltip': '{pooled} pooled in pools, {bonded} bonded in nodes',
  'pools.incentivependulum.error': 'Error while loading data of Incentive Pendulum'
}

export default pools
