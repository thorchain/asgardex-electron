import React from 'react'

import { storiesOf } from '@storybook/react'
import { Balance, Balances } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetBNB,
  AssetRune67C,
  assetToBase,
  assetToString,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { TRANSFER_FEES } from '../../../../../shared/mock/fees'
import { SendTxParams } from '../../../../services/binance/transaction'
import { AddressValidation } from '../../../../services/binance/types'
import { SendFormBNB } from './index'

const bnbAsset: Balance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.23))
}

const runeAsset: Balance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2))
}

const balances: Balances = [bnbAsset, runeAsset]

const fee = O.some(TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ to, amount, asset, memo }: SendTxParams) =>
  console.log(`to: ${to}, amount ${formatAssetAmount({ amount })}, asset: ${assetToString(asset)}, memo: ${memo}`)

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
  .add('send rune', () => (
    <SendFormBNB
      balance={runeAsset}
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
