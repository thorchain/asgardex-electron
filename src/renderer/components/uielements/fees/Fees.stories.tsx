import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { baseAmount, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'

import { Fees } from './'

const baseFee = {
  amount: baseAmount('31500'),
  asset: AssetRuneNative
}

export const DefaultPoolShare = () => <Fees fees={RD.success([baseFee])} />

storiesOf('Components/Fees', module)
  .add('The only fee', () => {
    return <DefaultPoolShare />
  })
  .add('reload fee', () => {
    return <Fees fees={RD.success([baseFee])} reloadFees={() => console.log('reload fees')} />
  })
  .add('Multiple fees', () => {
    return (
      <Fees
        fees={RD.success([
          baseFee,
          {
            amount: baseAmount('1750'),
            asset: AssetBTC
          }
        ])}
      />
    )
  })
  .add('Loading fees', () => <Fees fees={RD.pending} />)
  .add('Error while loading fees', () => <Fees fees={RD.failure(Error('Error here'))} />)
