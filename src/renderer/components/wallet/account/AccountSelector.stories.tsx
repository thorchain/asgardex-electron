import { ComponentMeta } from '@storybook/react'
import { assetAmount, AssetBNB, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { mockWalletBalance } from '../../../helpers/test/testWalletHelper'
import { AccountSelector as Component } from './index'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Deposit/PendingAssets',
  argTypes: {
    walletBalances: {
      options: ['none', 'few'],
      mapping: {
        none: [],
        few: [AssetBNB, ASSETS_MAINNET.TOMO].map((asset) => ({
          walletType: 'keystore',
          asset,
          amount: assetToBase(assetAmount(1)),
          walletAddress: `${assetToString(asset)} wallet`,
          walletIndex: 0
        })),
        defaultValue: 'few'
      }
    }
  },
  args: {
    network: 'testnet',
    selectedWallet: mockWalletBalance({
      asset: AssetBNB,
      walletAddress: 'bnb-ledger-address'
    })
  }
}

export default meta
