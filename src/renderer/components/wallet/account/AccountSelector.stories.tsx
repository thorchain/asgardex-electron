import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { mockWalletBalance } from '../../../helpers/test/testWalletHelper'
import { WalletBalance } from '../../../services/wallet/types'
import { AccountSelector } from './index'

const balanceBNB: WalletBalance = mockWalletBalance({
  asset: AssetBNB,
  walletAddress: 'bnb-ledger-address'
})

storiesOf('Wallet/AccountSelector', module)
  .add('default', () => {
    return (
      <AccountSelector
        selectedWallet={balanceBNB}
        walletBalances={[AssetBNB, ASSETS_MAINNET.TOMO].map((asset) => ({
          walletType: 'keystore',
          asset,
          amount: assetToBase(assetAmount(1)),
          walletAddress: `${assetToString(asset)} wallet`,
          walletIndex: 0
        }))}
        network="testnet"
      />
    )
  })
  .add('w/o dropdown', () => {
    return <AccountSelector selectedWallet={balanceBNB} walletBalances={[]} network="testnet" />
  })
