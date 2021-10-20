import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative, baseAmount, bn } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { AssetMenu } from './AssetMenu'

const priceIndex = {
  RUNE: bn(1),
  BNB: bn(2),
  BTC: bn(3)
}

const balanceBNB: WalletBalance = {
  walletType: 'ledger',
  amount: baseAmount('1'),
  asset: AssetBNB,
  walletAddress: ''
}

const balanceBTC: WalletBalance = {
  ...balanceBNB,
  walletType: 'keystore',
  asset: AssetBTC
}

const balanceRuneNative: WalletBalance = {
  ...balanceBNB,
  asset: AssetRuneNative
}

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
