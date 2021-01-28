import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Fees } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetETH,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'

import { ZERO_BASE_AMOUNT } from '../../../../const'
import { WalletBalances } from '../../../../services/clients'
import { SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'
import { Props as SendFormETHProps } from './SendFormETH'

const ethAsset: WalletBalance = {
  asset: AssetETH,
  amount: assetToBase(assetAmount(1.23)),
  walletAddress: 'AssetETH wallet address'
}

const balances: WalletBalances = [ethAsset]

const fees: Fees = {
  type: 'base',
  fastest: baseAmount(3000),
  fast: baseAmount(2000),
  average: baseAmount(1000)
}

const feesRD = RD.success(fees)

const estimateFee = () => Promise.resolve(ZERO_BASE_AMOUNT)

const reloadFeesHandler = () => console.log('reload fees')

const defaultProps: SendFormETHProps = {
  balances,
  balance: ethAsset,
  onSubmit: ({ recipient, amount, asset, memo, gasPrice }: SendTxParams) =>
    console.log(
      `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
        asset
      )}, memo: ${memo}, fee: ${gasPrice}`
    ),

  isLoading: false,
  addressValidation: () => true,
  fees: feesRD,
  estimateFee,
  reloadFeesHandler
}

export const SendETH: Story = () => <SendFormETH {...defaultProps} />
SendETH.storyName = 'success'

export const Pending: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, isLoading: true }
  return <SendFormETH {...props} />
}

export const LoadingFees: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, fees: RD.pending }
  return <SendFormETH {...props} />
}

export const FailtureFees: Story = () => {
  const props: SendFormETHProps = {
    ...defaultProps,
    fees: RD.failure(Error('Could not load fee and rates for any reason'))
  }
  return <SendFormETH {...props} />
}

const meta: Meta = {
  component: SendFormETH,
  title: 'Wallet/SendFormETH'
}

export default meta
