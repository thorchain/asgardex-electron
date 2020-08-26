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

const selectedAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.BNB,
  balance: assetAmount(1)
}

const balances: AssetsWithBalance = [selectedAsset]
const explorerUrl = O.none
const fee = O.some(TRANSFER_FEES.single)

const addressValidation: AddressValidation = (_) => true

storiesOf('Wallet/Send', module)
  .add('send', () => {
    return (
      <Send
        selectedAsset={selectedAsset}
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
        selectedAsset={selectedAsset}
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
        selectedAsset={selectedAsset}
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
        selectedAsset={selectedAsset}
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
        selectedAsset={selectedAsset}
        assetsWB={balances}
        transactionService={createServiceProp(EMPTY)}
        explorerUrl={explorerUrl}
        addressValidation={addressValidation}
        fee={O.none}
      />
    )
  })
