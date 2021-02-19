import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { FeeRates } from '@xchainjs/xchain-bitcoin'
import { Fees } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetBTC,
  AssetRuneNative,
  assetToBase,
  baseAmount,
  formatBaseAmount
} from '@xchainjs/xchain-util'

import { BTC_DECIMAL } from '../../../../helpers/assetHelper'
import { AddressValidation } from '../../../../services/binance/types'
import { SendTxParams } from '../../../../services/bitcoin/types'
import { WalletBalances } from '../../../../services/clients'
import { WalletBalance } from '../../../../types/wallet'
import { SendFormBTC } from './index'

const bnbAsset: WalletBalance = {
  asset: AssetBTC,
  amount: assetToBase(assetAmount(1.23, BTC_DECIMAL)),
  walletAddress: 'btc wallet address'
}

const runeAsset: WalletBalance = {
  asset: AssetRuneNative,
  amount: assetToBase(assetAmount(2, BTC_DECIMAL)),
  walletAddress: 'rune wallet address'
}

const balances: WalletBalances = [bnbAsset, runeAsset]

const fees: Fees = {
  type: 'base',
  fastest: baseAmount(3000),
  fast: baseAmount(2000),
  average: baseAmount(1000)
}

const rates: FeeRates = {
  fastest: 5,
  fast: 3,
  average: 2
}

const feesWithRatesRD = RD.success({ fees, rates })

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ recipient, amount, feeRate, memo }: SendTxParams) =>
  console.log(
    `to: ${recipient}, amount ${formatBaseAmount(amount)}, feeRate: ${JSON.stringify(feeRate)}, memo: ${memo}`
  )

const reloadFeesHandler = () => console.log('reload fees')

storiesOf('Wallet/SendFormBTC', module)
  .add('send', () => (
    <SendFormBTC
      walletBalance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      feesWithRates={feesWithRatesRD}
      network="testnet"
    />
  ))
  .add('pending', () => (
    <SendFormBTC
      walletBalance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      feesWithRates={feesWithRatesRD}
      reloadFeesHandler={reloadFeesHandler}
      isLoading={true}
      network="testnet"
    />
  ))
  .add('loading fees', () => (
    <SendFormBTC
      walletBalance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      feesWithRates={RD.pending}
      network="testnet"
    />
  ))
  .add('failure fees', () => (
    <SendFormBTC
      walletBalance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      feesWithRates={RD.failure(Error('Could not load fee and rates for any reason'))}
      network="testnet"
    />
  ))
  .add('amount < fees', () => (
    <SendFormBTC
      walletBalance={bnbAsset}
      balances={balances}
      onSubmit={onSubmitHandler}
      reloadFeesHandler={reloadFeesHandler}
      addressValidation={addressValidation}
      feesWithRates={feesWithRatesRD}
      network="testnet"
    />
  ))
