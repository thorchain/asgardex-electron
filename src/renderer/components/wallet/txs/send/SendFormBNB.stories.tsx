import React from 'react'

import { storiesOf } from '@storybook/react'
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
import { AssetWithBalance, AssetsWithBalance } from '../../../../services/wallet/types'
import { SendFormBNB } from './index'

const bnbAsset: AssetWithBalance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(1.23))
}

const runeAsset: AssetWithBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2))
}

const balances: AssetsWithBalance = [bnbAsset, runeAsset]

const fee = O.some(TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ to, amount, asset, memo }: SendTxParams) =>
  console.log(`to: ${to}, amount ${formatAssetAmount({ amount })}, asset: ${assetToString(asset)}, memo: ${memo}`)

storiesOf('Wallet/SendFormBNB', module)
  .add('send bnb', () => (
    <SendFormBNB
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
    />
  ))
  .add('send rune', () => (
    <SendFormBNB
      assetWB={runeAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
    />
  ))
  .add('pending', () => (
    <SendFormBNB
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
      isLoading={true}
    />
  ))
  .add('no fees', () => (
    <SendFormBNB
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.none}
    />
  ))
  .add('bnb amount < fees', () => (
    <SendFormBNB
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.some(assetAmount(1.234))}
    />
  ))
