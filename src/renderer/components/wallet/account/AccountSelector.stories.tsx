import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AccountSelector } from './index'

storiesOf('Wallet/AccountSelector', module)
  .add('default', () => {
    return (
      <AccountSelector
        selectedAsset={ASSETS_MAINNET.BOLT}
        walletBalances={[ASSETS_MAINNET.BNB, ASSETS_MAINNET.TOMO].map((asset) => ({
          asset,
          amount: assetToBase(assetAmount(1)),
          walletAddress: O.some(`${assetToString(asset)} wallet`)
        }))}
      />
    )
  })
  .add('w/o dropdown', () => {
    return <AccountSelector selectedAsset={ASSETS_MAINNET.BOLT} walletBalances={[]} />
  })
