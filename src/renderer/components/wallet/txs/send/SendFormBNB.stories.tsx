import React from 'react'

import { Story, Meta } from '@storybook/react'
import {
  assetAmount,
  AssetBNB,
  AssetRune67C,
  assetToBase,
  assetToString,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_TRANSFER_FEES } from '../../../../../shared/mock/fees'
import { SendTxParams } from '../../../../services/binance/types'
import { WalletBalances } from '../../../../services/clients'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormBNB, Props as SendFormBNBProps } from './SendFormBNB'

const bnbAsset: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.23)),
  walletAddress: 'AssetBNB wallet address'
}

const runeAsset: WalletBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2)),
  walletAddress: 'AssetRune67C wallet address'
}

const balances: WalletBalances = [bnbAsset, runeAsset]

const defaultProps: SendFormBNBProps = {
  balances,
  balance: bnbAsset,
  onSubmit: ({ recipient, amount, asset, memo }: SendTxParams) =>
    console.log(
      `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
        asset
      )}, memo: ${memo}`
    ),

  isLoading: false,
  addressValidation: (_) => true,
  fee: O.some(BNB_TRANSFER_FEES.single),
  network: 'testnet'
}

export const SendBnb: Story = () => <SendFormBNB {...defaultProps} />

export const SendRune: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, balance: runeAsset }
  return <SendFormBNB {...props} />
}

export const Pending: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, isLoading: true }
  return <SendFormBNB {...props} />
}

export const NoFees: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, fee: O.none }
  return <SendFormBNB {...props} />
}

export const FeeNotCovered: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, fee: O.some(assetAmount(1.234)) }
  return <SendFormBNB {...props} />
}

const meta: Meta = {
  component: SendFormBNB,
  title: 'Wallet/SendFormBNB'
}

export default meta
