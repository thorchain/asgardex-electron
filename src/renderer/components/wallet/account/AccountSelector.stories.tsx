import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { WalletBalance } from '../../../services/wallet/types'
import { AccountSelector } from './index'

const balanceBNB: WalletBalance = {
  walletType: 'keystore',
  amount: assetToBase(assetAmount(1)),
  asset: AssetBNB,
  walletAddress: ''
}

storiesOf('Wallet/AccountSelector', module)
  .add('default', () => {
    return (
      <AccountSelector
        selectedWallet={balanceBNB}
        walletBalances={[AssetBNB, ASSETS_MAINNET.TOMO].map((asset) => ({
          walletType: 'keystore',
          asset,
          amount: assetToBase(assetAmount(1)),
          walletAddress: `${assetToString(asset)} wallet`
        }))}
        network="testnet"
      />
    )
  })
  .add('w/o dropdown', () => {
    return <AccountSelector selectedWallet={balanceBNB} walletBalances={[]} network="testnet" />
  })
