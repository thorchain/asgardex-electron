import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import { AssetETH } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ONE_BN } from '../../const'
import * as AT from '../../storybook/argTypes'
import { PoolHistoryActions } from '../../views/pool/PoolHistoryView.types'
import { PoolDetails as Component, Props } from './PoolDetails'
import { getEmptyPoolDetail, getEmptyPoolStatsDetail } from './PoolDetails.helpers'

const Template: StoryFn<Props> = (args) => <Component {...args} />
export const Default = Template.bind({})

const historyActions: PoolHistoryActions = {
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
  title: 'Components/PoolDetails',
  argTypes: {
    network: AT.network,
    watch: { action: 'watch' },
    unwatch: { action: 'unwatch' }
  },
  args: {
    network: 'mainnet',
    historyActions,
    poolDetail: RD.success(getEmptyPoolDetail()),
    reloadPoolDetail: () => console.log('reloadPoolDetail'),
    poolStatsDetail: RD.success(getEmptyPoolStatsDetail()),
    reloadPoolStatsDetail: () => console.log('reloadPoolStatsDetail'),
    priceSymbol: 'R',
    asset: AssetETH,
    watched: true,
    priceRatio: ONE_BN,
    HistoryView: () => <>Actions History Here</>,
    ChartView: () => <>Pool Chart Here</>
  }
}

export default meta
