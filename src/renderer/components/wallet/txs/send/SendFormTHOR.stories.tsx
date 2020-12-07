import React from 'react'

import { storiesOf } from '@storybook/react'
import {
  assetAmount,
  AssetRuneNative,
  assetToBase,
  assetToString,
  baseToAsset,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { TRANSFER_FEES } from '../../../../../shared/mock/fees'
import { AddressValidation, SendTxParams } from '../../../../services/binance/types'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormTHOR } from './index'

const runeWalletBalance: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(2)),
  walletAddress: 'rune wallet'
}

const balances: WalletBalance[] = [runeWalletBalance]

const fee = O.some(TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ recipient, amount, asset, memo }: SendTxParams) =>
  console.log(
    `to: ${recipient}, amount ${formatAssetAmount({ amount: baseToAsset(amount) })}, asset: ${assetToString(
      asset
    )}, memo: ${memo}`
  )

storiesOf('Wallet/SendFormTHOR', module)
  .add('send', () => (
    <SendFormTHOR
      balance={runeWalletBalance}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
    />
  ))
  .add('pending', () => (
    <SendFormTHOR
      balance={runeWalletBalance}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={fee}
      isLoading={true}
    />
  ))
  .add('no fees', () => (
    <SendFormTHOR
      balance={runeWalletBalance}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fee={O.none}
    />
  ))
