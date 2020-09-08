import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetFromString, baseAmount, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { AssetsWithBalance } from '../../services/wallet/types'
import AssetsTable from './AssetsTable'

const balances: AssetsWithBalance = [
  {
    amount: baseAmount('12200000000'),
    frozenAmount: O.none,
    asset: assetFromString('BNB.RUNE-67C') || EMPTY_ASSET
  },
  {
    amount: baseAmount('1000000'),
    frozenAmount: O.none,
    asset: assetFromString('BNB') || EMPTY_ASSET
  },
  {
    amount: baseAmount('300000000'),
    frozenAmount: O.none,
    asset: assetFromString('FTM-585') || EMPTY_ASSET
  }
]

storiesOf('Wallet/AssetsTable', module)
  .add('initial', () => {
    return <AssetsTable assetsRD={RD.initial} poolDetails={[]} />
  })
  .add('loading', () => {
    return <AssetsTable assetsRD={RD.pending} poolDetails={[]} />
  })
  .add('data', () => {
    return <AssetsTable assetsRD={RD.success(balances)} poolDetails={[]} />
  })
  .add('error', () => {
    return <AssetsTable assetsRD={RD.failure(new Error('Could not load data'))} poolDetails={[]} />
  })
