import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { FeeOptions } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import { assetAmount, AssetBTC, AssetRune67C, assetToBase, formatAssetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { AddressValidation } from '../../../../services/binance/types'
import { SendTxParams } from '../../../../services/bitcoin/types'
import { AssetWithBalance, AssetsWithBalance } from '../../../../services/wallet/types'
import SendFormBTC from './SendFormBTC'

const bnbAsset: AssetWithBalance = {
  asset: AssetBTC,
  amount: assetToBase(assetAmount(1.23)),
  frozenAmount: O.none
}

const runeAsset: AssetWithBalance = {
  asset: AssetRune67C,
  amount: assetToBase(assetAmount(2)),
  frozenAmount: O.none
}

const balances: AssetsWithBalance = [bnbAsset, runeAsset]

const feeOptions: FeeOptions = {
  fast: { feeRate: 1, feeTotal: 1.01 },
  regular: { feeRate: 2, feeTotal: 2.02 },
  slow: { feeRate: 3, feeTotal: 3.03 }
}

const feesRD = RD.success(feeOptions)

const addressValidation: AddressValidation = (_) => true

const onSubmitHandler = ({ to, amount, feeRate, memo }: SendTxParams) =>
  console.log(`to: ${to}, amount ${formatAssetAmount(amount, 8)}, feeRate: ${JSON.stringify(feeRate)}, memo: ${memo}`)

storiesOf('Wallet/SendFormBTC', module)
  .add('send', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
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
      isLoading={true}
    />
  ))
  .add('loading fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fees={RD.pending}
    />
  ))
  .add('amount < fees', () => (
    <SendFormBTC
      assetWB={bnbAsset}
      assetsWB={balances}
      onSubmit={onSubmitHandler}
      addressValidation={addressValidation}
      fees={feesRD}
    />
  ))
