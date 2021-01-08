import React from 'react'

import { storiesOf } from '@storybook/react'
import {
  assetAmount,
  AssetBNB,
  assetToBase,
  assetToString,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BNB_TRANSFER_FEES } from '../../../../../shared/mock/fees'
import { AddressValidation, SendTxParams } from '../../../../services/binance/types'
import { WalletBalances } from '../../../../services/clients'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormBNB } from './index'

const bnbAsset: WalletBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.23)),
  walletAddress: 'AssetBNB wallet address'
}

const balances: WalletBalances = [bnbAsset]

const fee = O.some(BNB_TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ recipient, amount, asset, memo }: SendTxParams) =>
  console.log(
    `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
      asset
    )}, memo: ${memo}`
  )

storiesOf('Wallet/SendFormBNB', module)
  .add('send bnb', () => (
    <SendFormBNB
      balance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
    />
  ))
  .add('pending', () => (
    <SendFormBNB
      balance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
      isLoading={true}
    />
  ))
  .add('no fees', () => (
    <SendFormBNB
      balance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.none}
    />
  ))
  .add('bnb amount < fees', () => (
    <SendFormBNB
      balance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.some(assetAmount(1.234))}
    />
  ))
