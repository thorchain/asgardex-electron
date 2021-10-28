import React from 'react'

import { Meta, Story } from '@storybook/react'
import { bn, AssetBNB, assetAmount, assetToBase, AssetBTC } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { WalletBalance } from '../../../../services/wallet/types'
import { AssetCard, Props as AssetCardProps } from './AssetCard'

const balanceBNB: WalletBalance = mockWalletBalance({
  asset: AssetBNB,
  walletAddress: 'bnb-address'
})

const balanceBTC: WalletBalance = mockWalletBalance({
  asset: AssetBTC,
  walletAddress: 'btc-address'
})

const balanceRuneNative: WalletBalance = mockWalletBalance()

const balances = [balanceBNB, balanceBTC, balanceRuneNative]

const defaultProps: AssetCardProps = {
  assetBalance: O.none,
  asset: AssetBNB,
  balances,
  selectedAmount: ZERO_BASE_AMOUNT,
  onChangeAssetAmount: (value) => console.log('assetAmount', value),
  inputOnFocusHandler: () => console.log('onFocus'),
  inputOnBlurHandler: () => console.log('onBlur'),
  onChangePercent: (percent) => console.log('percent', percent),
  price: bn(600),
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
