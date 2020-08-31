import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { EMPTY, Observable, of } from 'rxjs'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { TRANSFER_FEES } from '../../../../shared/mock/fees'
import { AssetWithBalance, AssetsWithBalance, TransferRD, AddressValidation } from '../../../services/binance/types'
import Send from './Send'

// eslint-disable-next-line
const createServiceProp = (value: Observable<TransferRD>) => ({
  txRD$: value,
  pushTx: () => of(RD.initial).subscribe(),
  resetTx: () => null
})

const bnbAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.BNB,
  balance: assetAmount(1)
}

const runeAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.RUNE,
  balance: assetAmount(2)
}

const balances: AssetsWithBalance = [bnbAsset, runeAsset]
const explorerUrl = O.none
const fee = O.some(TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

storiesOf('Wallet/Send', module)
  .add('send bnb', () => {
    return (
      <Send
        selectedAsset={bnbAsset}
        assetsWB={balances}
        transactionService={createServiceProp(EMPTY)}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={fee}
      />
    )
  })
  .add('send rune', () => {
    return (
      <Send
        selectedAsset={runeAsset}
        assetsWB={balances}
        transactionService={createServiceProp(EMPTY)}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={fee}
      />
    )
  })
  .add('pending', () => {
    return (
      <Send
        selectedAsset={bnbAsset}
        assetsWB={balances}
        transactionService={createServiceProp(of(RD.pending))}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={fee}
      />
    )
  })
  .add('error', () => {
    return (
      <Send
        selectedAsset={bnbAsset}
        assetsWB={balances}
        transactionService={createServiceProp(of(RD.failure(Error('error example'))))}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={fee}
      />
    )
  })
  .add('success', () => {
    return (
      <Send
        selectedAsset={bnbAsset}
        assetsWB={balances}
        addressValidation={addressValidation}
        transactionService={createServiceProp(
          of(
            RD.success({
              code: 200,
              hash: 'ABC123',
              log: '',
              ok: true
            })
          )
        )}
        explorerUrl={explorerUrl}
        fee={fee}
      />
    )
  })
  .add('no fees', () => {
    return (
      <Send
        selectedAsset={bnbAsset}
        assetsWB={balances}
        transactionService={createServiceProp(EMPTY)}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={O.none}
      />
    )
  })
  .add('bnb amount < fees', () => {
    return (
      <Send
        selectedAsset={bnbAsset}
        assetsWB={balances}
        transactionService={createServiceProp(EMPTY)}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={O.some(assetAmount(1.23))}
      />
    )
  })
