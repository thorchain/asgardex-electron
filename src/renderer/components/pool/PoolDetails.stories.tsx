import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta } from '@storybook/react'
import { AssetETH } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ONE_BN } from '../../const'
import { PoolHistoryActions } from '../../views/pool/PoolHistoryView.types'
import { PoolDetails as Component } from './PoolDetails'
import { getEmptyPoolDetail, getEmptyPoolStatsDetail } from './PoolDetails.helpers'

export const historyActions: PoolHistoryActions = {
  requestParams: { itemsPerPage: 0, page: 0 },
  loadHistory: (params) => console.log('load history', params),
  setFilter: (filter) => console.log('filter', filter),
  setPage: (page) => console.log('page', page),
  reloadHistory: () => console.log('reloadHistory'),
  historyPage: RD.initial,
  prevHistoryPage: O.none
}

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/pool/PoolDetails',
  args: {
    historyActions: historyActions,
    poolDetail: RD.success(getEmptyPoolDetail()),
    reloadPoolDetail: () => console.log('reloadPoolDetail'),
    poolStatsDetail: RD.success(getEmptyPoolStatsDetail()),
    reloadPoolStatsDetail: () => console.log('reloadPoolStatsDetail'),
    network: 'testnet',
    priceSymbol: 'R',
    asset: AssetETH,
    watched: true,
    watch: () => console.log('watch'),
    unwatch: () => console.log('unwatch'),
    priceRatio: ONE_BN,
    HistoryView: () => <>Actions History Here</>,
    ChartView: () => <>Pool Chart Here</>,
    disableTradingPoolAction: false,
    disableAllPoolActions: false,
    disablePoolActions: false
  }
}

export default meta
