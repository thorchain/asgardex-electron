import React from 'react'

import { storiesOf } from '@storybook/react'
import {
  assetAmount,
  AssetETH,
  assetToBase,
  assetToString,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_TRANSFER_FEES } from '../../../../../shared/mock/fees'
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

const fee = O.some(BNB_TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ recipient, amount, asset, memo }: SendTxParams) =>
  console.log(
    `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
      asset
    )}, memo: ${memo}`
  )

storiesOf('Wallet/SendFormETH', module)
  .add('send eth', () => (
    <SendFormETH
      balance={ethAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
    />
  ))
  .add('pending', () => (
    <SendFormETH
      balance={ethAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
      isLoading={true}
    />
  ))
  .add('no fees', () => (
    <SendFormETH
      balance={ethAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.none}
    />
  ))
  .add('eth amount < fees', () => (
    <SendFormETH
      balance={ethAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.some(assetAmount(1.234))}
    />
  ))
