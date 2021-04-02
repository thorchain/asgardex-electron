import React from 'react'

import { storiesOf } from '@storybook/react'
import { AssetETH } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { poolDetailMock, poolStatsDetailMock } from '../../../shared/mock/pool'
import { ZERO_BN } from '../../const'
import { PoolDetails } from './PoolDetails'

export const PoolDetailsStory = () => {
  return (
    <PoolDetails
      poolDetail={poolDetailMock}
      poolStatsDetail={poolStatsDetailMock}
      priceRatio={ZERO_BN}
      earningsHistory={O.none}
      priceSymbol={'R'}
      asset={AssetETH}
      HistoryView={() => <>Actions History Here</>}
    />
  )
}

storiesOf('Components/pool/PoolDetails', module).add('default', PoolDetailsStory)
