import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import {
  assetAmount,
  AssetBNB,
  AssetRune67C,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'

import { mockValidatePassword$ } from '../../../../../shared/mock/wallet'
import { SendTxParams } from '../../../../services/binance/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { SendFormBNB, Props as SendFormBNBProps } from './SendFormBNB'

const bnbBalance: WalletBalance = {
  walletType: 'keystore',
  asset: AssetBNB,
  amount: assetToBase(assetAmount(123)),
  walletAddress: 'AssetBNB wallet address'
}

const runeBalance: WalletBalance = {
  walletType: 'keystore',
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(234)),
  walletAddress: 'AssetRune67C wallet address'
}

const defaultProps: SendFormBNBProps = {
  walletType: 'keystore',
  balances: [bnbBalance, runeBalance],
  balance: bnbBalance,
  onSubmit: ({ recipient, amount, asset, memo }: SendTxParams) =>
    console.log(
      `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
        asset
      )}, memo: ${memo}`
    ),

  isLoading: false,
  addressValidation: (_: string) => true,
  fee: RD.success(baseAmount(37500)),
  reloadFeesHandler: () => console.log('reload fees'),
  validatePassword$: mockValidatePassword$,
  sendTxStatusMsg: '',
  network: 'testnet'
}

export const SendBnb: Story = () => <SendFormBNB {...defaultProps} />

export const SendRune: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, balance: runeBalance }
  return <SendFormBNB {...props} />
}

export const Pending: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, isLoading: true, sendTxStatusMsg: 'Step 1/2' }
  return <SendFormBNB {...props} />
}

export const NoFees: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, fee: RD.failure(Error('no fees')) }
  return <SendFormBNB {...props} />
}

export const FeeNotCovered: Story = () => {
  const props: SendFormBNBProps = { ...defaultProps, balances: [{ ...bnbBalance, amount: baseAmount(30) }] }
  return <SendFormBNB {...props} />
}

const meta: Meta = {
  component: SendFormBNB,
  title: 'Wallet/SendFormBNB'
}

export default meta
