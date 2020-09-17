import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetFromString, baseAmount, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { AssetsWBChains } from '../../../services/wallet/types'
import AssetsTableCollapsable from './AssetsTableCollapsable'

const assetsWBChains: AssetsWBChains = [
  {
    chainName: 'Thorchain',
    assetsWB: RD.success([
      {
        amount: baseAmount('12200000000'),
        frozenAmount: O.none,
        asset: assetFromString('BNB.RUNE-67C') || EMPTY_ASSET
      }
    ])
  },
  {
    chainName: 'Binance Chain',
    assetsWB: RD.success([
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
  }
]

storiesOf('Wallet/AssetsTableCollapsable', module).add('initial', () => {
  return <AssetsTableCollapsable assetsWBChains={assetsWBChains} poolDetails={[]} />
})
