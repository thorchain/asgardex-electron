import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AccountSelector } from './index'

storiesOf('Wallet/AccountSelector', module)
  .add('default', () => {
    return (
      <AccountSelector
        selectedAsset={ASSETS_MAINNET.BOLT}
        walletBalances={[AssetBNB, ASSETS_MAINNET.TOMO].map((asset) => ({
          asset,
          amount: assetToBase(assetAmount(1)),
          walletAddress: `${assetToString(asset)} wallet`
        }))}
        network="testnet"
      />
    )
  })
  .add('w/o dropdown', () => {
    return <AccountSelector selectedAsset={ASSETS_MAINNET.BOLT} walletBalances={[]} network="testnet" />
  })
