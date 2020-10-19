import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { EMPTY, Observable, of } from 'rxjs'

import { ASSETS_MAINNET } from '../../../../../shared/mock/assets'
import { TRANSFER_FEES } from '../../../../../shared/mock/fees'
import { FreezeRD } from '../../../../services/binance/types'
import { AssetWithBalance } from '../../../../services/wallet/types'
import { Freeze } from './index'

const createServiceProp = (value: Observable<FreezeRD>) => ({
  txRD$: value,
  pushTx: () => of(RD.initial).subscribe(),
  resetTx: () => null
})

const selectedAsset: AssetWithBalance = {
  asset: ASSETS_MAINNET.RUNE,
  amount: assetToBase(assetAmount(1)),
  frozenAmount: O.none
}

const explorerUrl = O.none
const fee = O.some(TRANSFER_FEES.single)
const bnbAmount = O.some(assetAmount(1))

storiesOf('Wallet/Freeze', module)
  .add('freeze', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(EMPTY)}
        fee={fee}
        bnbAmount={bnbAmount}
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
        fee={fee}
        bnbAmount={bnbAmount}
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
        fee={fee}
        bnbAmount={bnbAmount}
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
        fee={fee}
        bnbAmount={bnbAmount}
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
        fee={fee}
        bnbAmount={bnbAmount}
      />
    )
  })
  .add('no fees', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(EMPTY)}
        fee={O.none}
        bnbAmount={bnbAmount}
      />
    )
  })
  .add('no bnb amount', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(EMPTY)}
        fee={fee}
        bnbAmount={O.none}
      />
    )
  })
  .add('bnb amount < fees', () => {
    return (
      <Freeze
        freezeAction="freeze"
        explorerUrl={explorerUrl}
        selectedAsset={selectedAsset}
        freezeService={createServiceProp(EMPTY)}
        fee={fee}
        bnbAmount={O.some(assetAmount(0.00000001))}
      />
    )
  })
