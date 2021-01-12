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
import { AddressValidation, SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormETH } from './index'

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

const addressValidation: AddressValidation = (_) => true

const estimateFee = () => Promise.resolve(ZERO_BASE_AMOUNT)

const onSubmitHandler = ({ recipient, amount, asset, memo, gasPrice }: SendTxParams) =>
  console.log(
    `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
      asset
    )}, memo: ${memo}, fee: ${gasPrice}`
  )

const reloadFeesHandler = () => console.log('reload fees')

export const StorySend: Story = () => (
  <SendFormETH
    balance={ethAsset}
    balances={balances}
    onSubmit={onSubmitHandler}
    addressValidation={addressValidation}
    reloadFeesHandler={reloadFeesHandler}
    fees={feesRD}
    estimateFee={estimateFee}
  />
)
StorySend.storyName = 'success'

export const StoryPending: Story = () => (
  <SendFormETH
    balance={ethAsset}
    balances={balances}
    onSubmit={onSubmitHandler}
    addressValidation={addressValidation}
    reloadFeesHandler={reloadFeesHandler}
    fees={feesRD}
    estimateFee={estimateFee}
    isLoading={true}
  />
)
StoryPending.storyName = 'pending'

export const StoryLoadingFees: Story = () => (
  <SendFormETH
    balance={ethAsset}
    balances={balances}
    onSubmit={onSubmitHandler}
    addressValidation={addressValidation}
    reloadFeesHandler={reloadFeesHandler}
    fees={RD.pending}
    estimateFee={estimateFee}
  />
)
StoryLoadingFees.storyName = 'loading fees'

export const StoryFailureFees: Story = () => (
  <SendFormETH
    balance={ethAsset}
    balances={balances}
    onSubmit={onSubmitHandler}
    addressValidation={addressValidation}
    reloadFeesHandler={reloadFeesHandler}
    fees={RD.failure(Error('Could not load fee and rates for any reason'))}
    estimateFee={estimateFee}
  />
)
StoryFailureFees.storyName = 'failure fees'

const meta: Meta = {
  component: SendFormETH,
  title: 'Components/SendFormETH',
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta
