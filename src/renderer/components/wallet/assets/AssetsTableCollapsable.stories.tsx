import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Asset, assetFromString, assetToString, baseAmount, EMPTY_ASSET } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { ApiError, AssetsWBChain, AssetsWBChains, ErrorId } from '../../../services/wallet/types'
import AssetsTableCollapsable from './AssetsTableCollapsable'

const assetsWBChainRUNE: AssetsWBChain = {
  address: 'thor1766mazrxs5asuscepa227r6ekr657234f8p7nf',
  chainId: 'Thorchain',
  assetsWB: RD.initial
}

const assetsWBChainBNB: AssetsWBChain = {
  address: 'bnb1zzapwywxrxa2wyyrp93ls5l0a6ftxju5phmhu9',
  chainId: 'Binance',
  assetsWB: RD.initial
}

const assetsWBChainBTC: AssetsWBChain = {
  address: 'bc11766mazrxs5asuscepa227r6ekr657234f8p7nf',
  chainId: 'BTC',
  assetsWB: RD.initial
}

const assetsWBChains: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    assetsWB: RD.success([
      {
        amount: baseAmount('12200000000'),
        frozenAmount: O.none,
        asset: assetFromString('BNB.RUNE-67C') || EMPTY_ASSET
      }
    ])
  },
  {
    ...assetsWBChainBTC,
    assetsWB: RD.success([
      {
        amount: baseAmount('1230000'),
        frozenAmount: O.none,
        asset: assetFromString('BTC.BTC') || EMPTY_ASSET
      }
    ])
  },
  {
    ...assetsWBChainBNB,
    assetsWB: RD.success([
      {
        amount: baseAmount('1000000'),
        frozenAmount: O.none,
        asset: assetFromString('BNB.BNB') || EMPTY_ASSET
      },
      {
        amount: baseAmount('300000000'),
        frozenAmount: O.none,
        asset: assetFromString('BNB.FTM-585') || EMPTY_ASSET
      }
    ])
  }
]

const assetsWBChainsLoading: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    assetsWB: RD.pending
  },
  {
    ...assetsWBChainBTC,
    assetsWB: RD.pending
  }
]
const apiError: ApiError = { errorId: ErrorId.GET_BALANCES, msg: 'error message' }
const assetsWBChainsError: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    assetsWB: RD.failure({ ...apiError, msg: 'RUNE error' })
  },
  {
    ...assetsWBChainBTC,
    assetsWB: RD.failure({ ...apiError, msg: 'BTC error' })
  }
]

const selectAssetHandler = (asset: Asset) => console.log('asset selected ', assetToString(asset))

storiesOf('Wallet/AssetsTableCollapsable', module).add('initial', () => {
  return (
    <AssetsTableCollapsable assetsWBChains={assetsWBChains} poolDetails={[]} selectAssetHandler={selectAssetHandler} />
  )
})
storiesOf('Wallet/AssetsTableCollapsable', module).add('loading', () => {
  return <AssetsTableCollapsable assetsWBChains={assetsWBChainsLoading} poolDetails={[]} />
})
storiesOf('Wallet/AssetsTableCollapsable', module).add('error', () => {
  return <AssetsTableCollapsable assetsWBChains={assetsWBChainsError} poolDetails={[]} />
})
