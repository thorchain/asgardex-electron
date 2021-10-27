import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB, AssetBTC, bn } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { WalletBalance } from '../../../../services/wallet/types'
import { AssetMenu } from './AssetMenu'

const priceIndex = {
  RUNE: bn(1),
  BNB: bn(2),
  BTC: bn(3)
}

const balanceBNB: WalletBalance = mockWalletBalance({
  walletType: 'ledger',
  asset: AssetBNB,
  walletAddress: 'bnb-ledger-address'
})

const balanceBTC: WalletBalance = mockWalletBalance({
  asset: AssetBTC,
  walletAddress: 'btc-address'
})

const balanceRuneNative: WalletBalance = mockWalletBalance()

const balances = [balanceBNB, balanceBTC, balanceRuneNative]

type Args = {
  withSearch: boolean
  network: Network
  onSelect: FP.Lazy<void>
}

const Template: Story<Args> = ({ network, withSearch, onSelect }) => (
  <AssetMenu
    withSearch={withSearch}
    asset={AssetBNB}
    balances={balances}
    priceIndex={priceIndex}
    onSelect={onSelect}
    searchDisable={[]}
    network={network}
  />
)

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta = {
  component: AssetMenu,
  title: 'Components/Assets/AssetMenu',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    withSearch: {
      name: 'with search',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    onSelect: {
      action: 'onSelect'
    }
  },
  decorators: [
    (S: Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
