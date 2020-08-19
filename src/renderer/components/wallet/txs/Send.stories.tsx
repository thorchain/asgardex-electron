import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { EMPTY, Observable, of } from 'rxjs'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetWithBalance, TransferRD, AssetsWithBalanceRD } from '../../../services/binance/types'
import Send from './Send'

// eslint-disable-next-line
const createServiceProp = (value: Observable<TransferRD>) => ({
  txRD$: value,
  pushTx: () => of(RD.initial).subscribe(),
  resetTx: () => null
})

const selectedAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.RUNE,
  balance: assetAmount(1),
  frozenBalance: assetAmount(1)
}

const balances: AssetsWithBalanceRD = RD.success([selectedAsset])
const explorerUrl = O.none

storiesOf('Wallet/Send', module)
  .add('send', () => {
    return (
      <Send
        selectedAsset={selectedAsset}
        balances={balances}
        transactionService={createServiceProp(EMPTY)}
        explorerUrl={explorerUrl}
      />
    )
  })
  .add('pending', () => {
    return (
      <Send
        selectedAsset={selectedAsset}
        balances={balances}
        transactionService={createServiceProp(of(RD.pending))}
        explorerUrl={explorerUrl}
      />
    )
  })
  .add('error', () => {
    return (
      <Send
        selectedAsset={selectedAsset}
        balances={balances}
        transactionService={createServiceProp(of(RD.failure(Error('error example'))))}
        explorerUrl={explorerUrl}
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
            RD.success({
              code: 200,
              hash: 'ABC123',
              log: '',
              ok: true
            })
          )
        )}
        explorerUrl={explorerUrl}
      />
    )
  })
