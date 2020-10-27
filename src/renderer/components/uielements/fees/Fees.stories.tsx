import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { baseAmount, AssetBTC } from '@thorchain/asgardex-util'

import { BASE_CHAIN_ASSET } from '../../../const'
import { Fees } from './'

const baseFee = {
  amount: baseAmount('31500'),
  asset: BASE_CHAIN_ASSET
}

export const DefaultPoolShare = () => <Fees fees={RD.success([baseFee])} />

storiesOf('Components/Fees', module)
  .add('The only fee', () => {
    return <DefaultPoolShare />
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
