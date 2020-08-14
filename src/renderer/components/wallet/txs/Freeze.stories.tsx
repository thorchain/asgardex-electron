import React from 'react'

import { failure, initial, pending, RemoteData, success } from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Transfer } from '@thorchain/asgardex-binance'
import { assetAmount } from '@thorchain/asgardex-util'
import { EMPTY, Observable, of } from 'rxjs'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetWithBalance } from '../../../services/binance/types'
import Freeze from './Freeze'

const createServiceProp = (value: Observable<RemoteData<Error, Transfer>>) => ({
  transaction$: value,
  pushTx: () => of(initial).subscribe(),
  resetTx: () => null
})

const selectedAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.RUNE,
  balance: assetAmount(1),
  frozenBalance: assetAmount(1)
}

storiesOf('Wallet/Freeze', module)
  .add('freeze', () => {
    return <Freeze freezeAction="freeze" selectedAsset={selectedAsset} transactionService={createServiceProp(EMPTY)} />
  })
  .add('unfreeze', () => {
    return (
      <Freeze freezeAction="unfreeze" selectedAsset={selectedAsset} transactionService={createServiceProp(EMPTY)} />
    )
  })
  .add('pending', () => {
    return (
      <Freeze freezeAction="freeze" selectedAsset={selectedAsset} transactionService={createServiceProp(of(pending))} />
    )
  })
  .add('error', () => {
    return (
      <Freeze
        freezeAction="freeze"
        selectedAsset={selectedAsset}
        transactionService={createServiceProp(of(failure(Error('error example'))))}
      />
    )
  })
  .add('success', () => {
    return (
      <Freeze
        freezeAction="freeze"
        selectedAsset={selectedAsset}
        transactionService={createServiceProp(
          of(
            success({
              code: 200,
              hash: '',
              log: '',
              ok: true
            })
          )
        )}
      />
    )
  })
