import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { EMPTY, Observable, of } from 'rxjs'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetWithBalance, FreezeRD } from '../../../services/binance/types'
import Freeze from './Freeze'

const createServiceProp = (value: Observable<FreezeRD>) => ({
  txRD$: value,
  pushTx: () => of(RD.initial).subscribe(),
  resetTx: () => null
})

const selectedAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.RUNE,
  balance: assetAmount(1),
  frozenBalance: assetAmount(1)
}

const explorerUrl = O.none

storiesOf('Wallet/Freeze', module)
  .add('freeze', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(EMPTY)}
      />
    )
  })
  .add('unfreeze', () => {
    return (
      <Freeze
        freezeAction="unfreeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(EMPTY)}
      />
    )
  })
  .add('pending', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(of(RD.pending))}
      />
    )
  })
  .add('error', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(of(RD.failure(Error('error example'))))}
      />
    )
  })
  .add('success', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(
          of(
            RD.success({
              code: 200,
              hash: 'ABC123',
              log: '',
              ok: true
            })
          )
        )}
      />
    )
  })
