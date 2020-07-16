import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Balances } from '@thorchain/asgardex-binance'

import AssetsTable from './AssetsTable'

const balances: Balances = [
  { free: '122', frozen: '0', locked: '0', symbol: 'RUNE-A1F' },
  { free: '0.01000000', frozen: '0', locked: '0', symbol: 'BNB' },
  { free: '3.00000000', frozen: '0', locked: '0', symbol: 'FTM-585' }
]

storiesOf('Wallet/AssetsTable', module)
  .add('initial', () => {
    return <AssetsTable balancesRD={RD.initial} poolDetails={[]} />
  })
  .add('loading', () => {
    return <AssetsTable balancesRD={RD.pending} poolDetails={[]} />
  })
  .add('data', () => {
    return <AssetsTable balancesRD={RD.success(balances)} poolDetails={[]} />
  })
  .add('error', () => {
    return <AssetsTable balancesRD={RD.failure(new Error('Could not load data'))} poolDetails={[]} />
  })
