import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative, baseAmount, bn } from '@xchainjs/xchain-util'

import { WalletBalance } from '../../../../services/wallet/types'
import { AssetMenu, Props as AssetMenuProps } from './AssetMenu'

const priceIndex = {
  RUNE: bn(1),
  BNB: bn(2),
  BTC: bn(3)
}

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

const defaultProps: AssetMenuProps = {
  withSearch: true,
  asset: AssetBNB,
  balances,
  priceIndex,
  searchDisable: [],
  onSelect: (key) => console.log(key),
  network: 'testnet'
}

export const StoryWithSearch: Story = () => <AssetMenu {...defaultProps} />

StoryWithSearch.storyName = 'with search'

export const StoryWithoutSearch: Story = () => {
  const props = {
    ...defaultProps,
    withSearch: false
  }
  return <AssetMenu {...props} />
}

StoryWithoutSearch.storyName = 'without search'

const meta: Meta = {
  component: AssetMenu,
  title: 'Components/Assets/AssetMenu',
  decorators: [
    (S: Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
