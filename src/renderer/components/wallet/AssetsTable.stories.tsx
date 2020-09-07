import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetFromString, baseAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { WalletBalances } from '../../services/wallet/types'
import AssetsTable from './AssetsTable'

const balances: WalletBalances = [
  {
    amount: baseAmount('12200000000'),
    asset: O.fromNullable(assetFromString('BNB.RUNE-67C'))
  },
  {
    amount: baseAmount('1000000'),
    asset: O.fromNullable(assetFromString('BNB'))
  },
  {
    amount: baseAmount('300000000'),
    asset: O.fromNullable(assetFromString('FTM-585'))
  }
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
