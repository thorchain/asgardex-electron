import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Meta, Story } from '@storybook/react'
import { Fees } from '@xchainjs/xchain-client'
import { FeesParams } from '@xchainjs/xchain-ethereum'
import {
  assetAmount,
  AssetETH,
  AssetRuneNative,
  assetToBase,
  assetToString,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'

import { SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'
import { Props as SendFormETHProps } from './SendFormETH'

const ethAsset: WalletBalance = {
  asset: AssetETH,
  amount: assetToBase(assetAmount(1.23)),
  walletAddress: 'AssetETH wallet address'
}

const runeAsset: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(2)),
  walletAddress: 'rune wallet address'
}

const fees: Fees = {
  type: 'byte',
  fastest: assetToBase(assetAmount(0.002499)),
  fast: assetToBase(assetAmount(0.002079)),
  average: assetToBase(assetAmount(0.001848))
}

const onSubmitHandler = ({ recipient, amount, asset, memo, feeOptionKey }: SendTxParams) =>
  console.log(
    `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${
      asset && assetToString(asset)
    }, memo: ${memo}, feeOptionKey: ${feeOptionKey}`
  )

const defaultProps: SendFormETHProps = {
  balances: [ethAsset, runeAsset],
  balance: ethAsset,
  onSubmit: onSubmitHandler,
  isLoading: false,
  fees: RD.success(fees),
  reloadFeesHandler: (p: FeesParams) => console.log('reloadFeesHandler', p),
  network: 'testnet'
}

export const Default: Story = () => <SendFormETH {...defaultProps} />
Default.storyName = 'default'

export const Pending: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, isLoading: true }
  return <SendFormETH {...props} />
}
Pending.storyName = 'pending'

export const FeesInitial: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, fees: RD.initial }
  return <SendFormETH {...props} />
}
FeesInitial.storyName = 'fees initial'

export const FeesLoading: Story = () => {
  const props: SendFormETHProps = { ...defaultProps, fees: RD.pending }
  return <SendFormETH {...props} />
}
FeesLoading.storyName = 'fees loading'

export const FeesFailure: Story = () => {
  const props: SendFormETHProps = {
    ...defaultProps,
    fees: RD.failure(Error('Could not load fee and rates for any reason'))
  }
  return <SendFormETH {...props} />
}
FeesFailure.storyName = 'fees failure'

const meta: Meta = {
  component: SendFormETH,
  title: 'Wallet/SendFormETH'
}

export default meta
