import React from 'react'

import { storiesOf } from '@storybook/react'
import BigNumber from 'bignumber.js'

import TokenDetailCard from './TokenDetailCard'

storiesOf('Components/TokenDetailCard', module).add('default', () => {
  return (
    <div style={{ padding: '20px' }}>
      <TokenDetailCard
        title="TOKEN DETAILS"
        target="LOKI"
        ticker="LOK"
        marketPrice={new BigNumber(0)}
        totalSupply={new BigNumber(40666138)}
      />
    </div>
  )
})
