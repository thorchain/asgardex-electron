import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { FeeRates } from '@xchainjs/xchain-bitcoin'
import { Fees } from '@xchainjs/xchain-client'
import { assetAmount, AssetBTC, AssetRune67C, assetToBase, baseAmount, formatBaseAmount } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { BTC_DECIMAL } from '../../../../helpers/assetHelper'
import { AddressValidation } from '../../../../services/binance/types'
import { SendTxParams } from '../../../../services/bitcoin/types'
import { AssetWithBalance, AssetsWithBalance } from '../../../../services/wallet/types'
import { SendFormBTC } from './index'

const bnbAsset: AssetWithBalance = {
  asset: AssetBTC,
  amount: assetToBase(assetAmount(1.23, BTC_DECIMAL)),
  frozenAmount: O.none
}

const runeAsset: AssetWithBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2, BTC_DECIMAL)),
  frozenAmount: O.none
}

const balances: AssetsWithBalance = [bnbAsset, runeAsset]

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

const onSubmitHandler = ({ to, amount, feeRate, memo }: SendTxParams) =>
  console.log(`to: ${to}, amount ${formatBaseAmount(amount)}, feeRate: ${JSON.stringify(feeRate)}, memo: ${memo}`)

const reloadFeesHandler = () => console.log('reload fees')

storiesOf('Wallet/SendFormBTC', module)
  .add('send', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      feesWithRates={feesWithRatesRD}
    />
  ))
  .add('pending', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      feesWithRates={feesWithRatesRD}
      reloadFeesHandler={reloadFeesHandler}
      isLoading={true}
    />
  ))
  .add('loading fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      feesWithRates={RD.pending}
    />
  ))
  .add('failure fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      feesWithRates={RD.failure(Error('Could not load fee and rates for any reason'))}
    />
  ))
  .add('amount < fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      reloadFeesHandler={reloadFeesHandler}
      addressValidation={addressValidation}
      feesWithRates={feesWithRatesRD}
    />
  ))
