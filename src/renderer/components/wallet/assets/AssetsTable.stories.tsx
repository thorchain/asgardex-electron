import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetFromString, baseAmount, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'

import { NonEmptyAssetsWithBalance } from '../../../services/wallet/types'
import AssetsTable from './AssetsTable'

const balances: O.Option<NonEmptyAssetsWithBalance> = NEA.fromArray([
  {
    amount: baseAmount('12200000000'),
    frozenAmount: O.none,
    asset: assetFromString('BNB.RUNE-67C') || EMPTY_ASSET
  },
  {
    amount: baseAmount('1000000'),
    frozenAmount: O.none,
    asset: assetFromString('BNB.BNB') || EMPTY_ASSET
  },
  {
    amount: baseAmount('300000000'),
    frozenAmount: O.none,
    asset: assetFromString('BNB.FTM-585') || EMPTY_ASSET
  }
])

storiesOf('Wallet/AssetsTable', module)
  .add('initial', () => {
    return <AssetsTable poolDetails={[]} />
  })
  .add('loading', () => {
    return <AssetsTable assetsLoading={true} poolDetails={[]} />
  })
  .add('data', () => {
    return <AssetsTable assetsWB={balances} poolDetails={[]} />
  })
