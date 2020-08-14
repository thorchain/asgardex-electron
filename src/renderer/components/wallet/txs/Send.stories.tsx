import React from 'react'

import { failure, initial, pending, RemoteData, success } from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount } from '@thorchain/asgardex-util'
import { EMPTY, Observable, of } from 'rxjs'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetsWithBalance, AssetWithBalance } from '../../../services/binance/types'
import Send from './Send'

// eslint-disable-next-line
const createServiceProp = (value: Observable<RemoteData<Error, any>>) => ({
  transaction$: value,
  pushTx: () => of(initial).subscribe(),
  resetTx: () => null
})

const selectedAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.RUNE,
  balance: assetAmount(1),
  frozenBalance: assetAmount(1)
}

const balances: AssetsWithBalance = [selectedAsset]

storiesOf('Wallet/Send', module)
  .add('send', () => {
    return <Send selectedAsset={selectedAsset} balances={balances} transactionService={createServiceProp(EMPTY)} />
  })
  .add('pending', () => {
    return (
      <Send selectedAsset={selectedAsset} balances={balances} transactionService={createServiceProp(of(pending))} />
    )
  })
  .add('error', () => {
    return (
      <Send
        selectedAsset={selectedAsset}
        balances={balances}
        transactionService={createServiceProp(of(failure(Error('error example'))))}
      />
    )
  })
  .add('success', () => {
    return (
      <Send
        selectedAsset={selectedAsset}
        balances={balances}
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
