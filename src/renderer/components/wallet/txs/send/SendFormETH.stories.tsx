// import React from 'react'

// import * as RD from '@devexperts/remote-data-ts'
import { Meta } from '@storybook/react'
// import { Fees } from '@xchainjs/xchain-client'
// import { GasLimits, GasPrices } from '@xchainjs/xchain-ethereum'
// import {
//   assetAmount,
//   AssetETH,
//   AssetRuneNative,
//   assetToBase,
//   assetToString,
//   baseAmount,
//   baseToAsset,
//   formatAssetAmount
// } from '@xchainjs/xchain-util'
// import { BigNumber } from 'ethers'

// import { ZERO_BASE_AMOUNT } from '../../../../const'
// import { WalletBalances } from '../../../../services/clients'
// import { SendTxParams } from '../../../../services/ethereum/types'
// import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'
// import { Props as SendFormETHProps } from './SendFormETH'

// const ethAsset: WalletBalance = {
//   asset: AssetETH,
//   amount: assetToBase(assetAmount(1.23)),
//   walletAddress: 'AssetETH wallet address'
// }

// const runeAsset: WalletBalance = {
//   asset: AssetRuneNative,
//   amount: assetToBase(assetAmount(2)),
//   walletAddress: 'rune wallet address'
// }

// const balances: WalletBalances = [ethAsset, runeAsset]

// const fees: Fees = {
//   type: 'base',
//   fastest: baseAmount(3000),
//   fast: baseAmount(2000),
//   average: baseAmount(1000)
// }

// const gasPrices: GasPrices = {
//   fastest: baseAmount(3),
//   fast: baseAmount(2),
//   average: baseAmount(1)
// }

// const gasLimits: GasLimits = {
//   fastest: BigNumber.from(300),
//   fast: BigNumber.from(200),
//   average: BigNumber.from(100)
// }

// const feesRD = RD.success({ fees, gasPrices, gasLimits })

// const onSubmitHandler = ({ recipient, amount, asset, memo, gasPrice, gasLimit }: SendTxParams) =>
//   console.log(
//     `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
//       asset
//     )}, memo: ${memo}, gasPrice: ${gasPrice}, gasLimit: ${gasLimit}`
//   )

// const reloadFeesHandler = () => console.log('reload fees')

// const fees$ = () => console.log('get fees')

// const defaultProps: SendFormETHProps = {
//   balances,
//   balance: ethAsset,
//   onSubmit: onSubmitHandler,
//   isLoading: false,
//   fees$,
//   reloadFeesHandler
// }

// export const SendETH: Story = () => <SendFormETH {...defaultProps} />
// SendETH.storyName = 'success'

// export const Pending: Story = () => {
//   const props: SendFormETHProps = { ...defaultProps, isLoading: true }
//   return <SendFormETH {...props} />
// }

// export const LoadingFees: Story = () => {
//   const props: SendFormETHProps = { ...defaultProps, fees: RD.pending }
//   return <SendFormETH {...props} />
// }

// export const FailtureFees: Story = () => {
//   const props: SendFormETHProps = {
//     ...defaultProps,
//     fees: RD.failure(Error('Could not load fee and rates for any reason'))
//   }
//   return <SendFormETH {...props} />
// }

const meta: Meta = {
  component: SendFormETH,
  title: 'Wallet/SendFormETH'
}

export default meta
