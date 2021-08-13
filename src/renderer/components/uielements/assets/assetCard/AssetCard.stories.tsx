import React from 'react'

import { Meta, Story } from '@storybook/react'
import { bn, AssetBNB, assetAmount, assetToBase, baseAmount, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { WalletBalance } from '../../../../services/wallet/types'
import { AssetCard, Props as AssetCardProps } from './AssetCard'

const balanceBNB: WalletBalance = {
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

const defaultProps: AssetCardProps = {
  title: 'Title here',
  assetBalance: O.none,
  asset: AssetBNB,
  balances,
  selectedAmount: ZERO_BASE_AMOUNT,
  onChangeAssetAmount: (value) => console.log('assetAmount', value),
  inputOnFocusHandler: () => console.log('onFocus'),
  inputOnBlurHandler: () => console.log('onBlur'),
  onChangePercent: (percent) => console.log('percent', percent),
  price: bn(600),
  priceIndex: {
    RUNE: bn(1)
  },
  percentValue: 55,
  maxAmount: assetToBase(assetAmount(10)),
  network: 'testnet'
}

export const Default: Story = () => <AssetCard {...defaultProps} />

Default.storyName = 'default'

const meta: Meta = {
  component: AssetCard,
  title: 'Components/Assets/AssetCard',
  decorators: [
    (S: Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta
