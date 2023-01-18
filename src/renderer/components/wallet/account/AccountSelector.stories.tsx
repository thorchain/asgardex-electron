import { ComponentMeta, StoryFn } from '@storybook/react'
import { assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetBNB } from '../../../../shared/utils/asset'
import { mockWalletBalance } from '../../../helpers/test/testWalletHelper'
import { WalletBalances } from '../../../services/clients'
import { WalletBalance } from '../../../services/wallet/types'
import { AccountSelector as Component, Props } from './AccountSelector'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const few: WalletBalances = [AssetBNB, ASSETS_MAINNET.TOMO].map<WalletBalance>((asset) => ({
  walletType: 'keystore',
  asset,
  amount: assetToBase(assetAmount(1)),
  walletAddress: `${assetToString(asset)} wallet`,
  walletIndex: 0,
  hdMode: 'default'
}))

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Deposit/PendingAssets',
  argTypes: {
    walletBalances: {
      options: ['none', 'few'],
      mapping: {
        none: [],
        few
      }
    }
  },
  args: {
    network: 'testnet',
    selectedWallet: mockWalletBalance({
      asset: AssetBNB,
      walletAddress: 'bnb-ledger-address'
    }),
    walletBalances: few
  }
}

export default meta
