import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AccountSelector } from './index'

storiesOf('Wallet/AccountSelector', module)
  .add('default', () => {
    return (
      <AccountSelector
        selectedAsset={ASSETS_MAINNET.BOLT}
        assets={[ASSETS_MAINNET.BNB, ASSETS_MAINNET.TOMO].map((asset) => ({
          asset,
          amount: assetToBase(assetAmount(1)),
          frozenAmount: O.none
        }))}
      />
    )
  })
  .add('w/o dropdown', () => {
    return <AccountSelector selectedAsset={ASSETS_MAINNET.BOLT} assets={[]} />
  })
