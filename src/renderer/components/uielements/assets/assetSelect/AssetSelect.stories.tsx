import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative, baseAmount, bn } from '@xchainjs/xchain-util'

import { WalletBalance } from '../../../../services/wallet/types'
import { AssetSelect, Props as AssetSelectProps } from './AssetSelect'

const balanceBNB: WalletBalance = {
  walletType: 'keystore',
  amount: baseAmount('1'),
  asset: AssetBNB,
  walletAddress: ''
}

const balanceBTC: WalletBalance = {
  ...balanceBNB,
  asset: AssetBTC
}

const balanceRuneNative: WalletBalance = {
  ...balanceBNB,
  asset: AssetRuneNative
}

const balances = [balanceBNB, balanceBTC, balanceRuneNative]

const defaultProps: AssetSelectProps = {
  asset: AssetBNB,
  balances,
  priceIndex: {
    RUNE: bn(1),
    BNB: bn(2),
    BTC: bn(3)
  },
  onSelect: () => {},
  withSearch: true,
  network: 'testnet'
}

export const Default: Story = () => <AssetSelect {...defaultProps} />

Default.storyName = 'default'

const meta: Meta = {
  component: AssetSelect,
  title: 'Components/Assets/AssetSelect',
  decorators: [
    (S: Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
