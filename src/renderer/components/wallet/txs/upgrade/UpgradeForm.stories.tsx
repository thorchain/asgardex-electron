import React from 'react'

import { Story, Meta } from '@storybook/react'
import { Balance } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetRune67C,
  assetToBase,
  assetToString,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { UpgradeForm, Props as UpgradeFormProps } from './UpgradeForm'

const defaultProps: UpgradeFormProps = {
  balance: {
    asset: AssetRune67C,
    amount: assetToBase(assetAmount(2)),
    walletAddress: 'BNB.Rune wallet address'
  },
  bnbAmount: O.some(assetAmount(1.23)),
  onSubmit: ({ amount, asset }: Balance) =>
    console.log(`amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(asset)}`),
  isLoading: false,
  fee: O.some(assetAmount(0.000375))
}

export const Default: Story = () => <UpgradeForm {...defaultProps} />
Default.storyName = 'default'

export const Pending: Story = () => {
  const props: UpgradeFormProps = { ...defaultProps, isLoading: true }
  return <UpgradeForm {...props} />
}
Pending.storyName = 'pending'

export const NoFees: Story = () => {
  const props: UpgradeFormProps = { ...defaultProps, fee: O.none }
  return <UpgradeForm {...props} />
}
NoFees.storyName = 'no fees'

export const FeesNotCovered: Story = () => {
  const props: UpgradeFormProps = { ...defaultProps, bnbAmount: O.some(assetAmount('0.00000003')) }
  return <UpgradeForm {...props} />
}
FeesNotCovered.storyName = 'fees not covered'

const meta: Meta = {
  component: UpgradeForm,
  title: 'Wallet/UpgradeForm'
}

export default meta
