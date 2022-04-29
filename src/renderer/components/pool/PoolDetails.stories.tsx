import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { AssetETH } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ONE_BN } from '../../const'
import { PoolHistoryActions } from '../../views/pool/PoolHistoryView.types'
import { PoolDetails } from './PoolDetails'
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

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      historyActions={historyActions}
      poolDetail={RD.success(getEmptyPoolDetail())}
      reloadPoolDetail={() => console.log('reloadPoolDetail')}
      poolStatsDetail={RD.success(getEmptyPoolStatsDetail())}
      reloadPoolStatsDetail={() => console.log('reloadPoolStatsDetail')}
      network={'testnet'}
      priceSymbol={'R'}
      asset={AssetETH}
      priceRatio={ONE_BN}
      HistoryView={() => <>Actions History Here</>}
      ChartView={() => <>Pool Chart Here</>}
      disableTradingPoolAction={false}
      disableAllPoolActions={false}
      disablePoolActions={false}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
