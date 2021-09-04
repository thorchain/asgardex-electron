import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetETH } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ONE_BN } from '../../const'
import { PoolDetails } from './PoolDetails'
import { getEmptyPoolDetail, getEmptyPoolStatsDetail } from './PoolDetails.helpers'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      poolDetail={getEmptyPoolDetail()}
      poolStatsDetail={getEmptyPoolStatsDetail()}
      network={'testnet'}
      earningsHistory={O.none}
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
