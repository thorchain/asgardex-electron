import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetETH } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { poolDetailMock, poolStatsDetailMock } from '../../../shared/mock/pool'
import { ONE_BN } from '../../const'
import { PoolDetails } from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      network={'testnet'}
      poolDetail={poolDetailMock}
      poolStatsDetail={poolStatsDetailMock}
      earningsHistory={O.none}
      priceSymbol={'R'}
      asset={AssetETH}
      priceRatio={ONE_BN}
      HistoryView={() => <>Actions History Here</>}
      ChartView={() => <>Pool Chart Here</>}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
