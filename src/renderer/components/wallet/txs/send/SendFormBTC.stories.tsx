import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { FeeOptions } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import { assetAmount, AssetBTC, AssetRune67C, assetToBase, formatBaseAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { BTC_DECIMAL } from '../../../../helpers/assetHelper'
import { AddressValidation } from '../../../../services/binance/types'
import { SendTxParams } from '../../../../services/bitcoin/types'
import { AssetWithBalance, AssetsWithBalance } from '../../../../services/wallet/types'
import SendFormBTC from './SendFormBTC'

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

const feeOptions: FeeOptions = {
  fast: { feeRate: 1, feeTotal: 3000 },
  regular: { feeRate: 2, feeTotal: 2000 },
  slow: { feeRate: 3, feeTotal: 1000 }
}

const feesRD = RD.success(feeOptions)

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
      fees={feesRD}
    />
  ))
  .add('pending', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fees={feesRD}
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
      fees={RD.pending}
    />
  ))
  .add('failure fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      reloadFeesHandler={reloadFeesHandler}
      fees={RD.failure(Error('Could not load fee for any reason'))}
    />
  ))
  .add('amount < fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      reloadFeesHandler={reloadFeesHandler}
      addressValidation={addressValidation}
      fees={feesRD}
    />
  ))
