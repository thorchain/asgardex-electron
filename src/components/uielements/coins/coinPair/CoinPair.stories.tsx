import React from 'react'

import { storiesOf } from '@storybook/react'

import { ASSETS_MAINNET } from '../../../../mock/assets'
import CoinPair from './CoinPair'

storiesOf('Components/Coins/CoinPair', module).add('default', () => {
  return (
    <div style={{ display: 'flex' }}>
      <CoinPair from={ASSETS_MAINNET.RUNE} to={ASSETS_MAINNET.BNB} />
    </div>
  )
})
