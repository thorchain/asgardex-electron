import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRune67C, assetToString, baseAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { getRunePricePool } from '../../../helpers/poolHelper'
import { ApiError, AssetsWBChain, AssetsWBChains, ErrorId } from '../../../services/wallet/types'
import { AssetsTableCollapsable } from './index'

const assetsWBChainRUNE: AssetsWBChain = {
  address: 'thor1766mazrxs5asuscepa227r6ekr657234f8p7nf',
  chain: 'THOR',
  assetsWB: RD.initial
}

const assetsWBChainBNB: AssetsWBChain = {
  address: 'bnb1zzapwywxrxa2wyyrp93ls5l0a6ftxju5phmhu9',
  chain: 'BNB',
  assetsWB: RD.initial
}

const assetsWBChainBTC: AssetsWBChain = {
  address: 'bc11766mazrxs5asuscepa227r6ekr657234f8p7nf',
  chain: 'BTC',
  assetsWB: RD.initial
}

const assetsWBChains: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    assetsWB: RD.success([
      {
        amount: baseAmount('12200000000'),
        frozenAmount: O.none,
        asset: AssetRune67C
      }
    ])
  },
  {
    ...assetsWBChainBTC,
    assetsWB: RD.success([
      {
        amount: baseAmount('1230000'),
        frozenAmount: O.none,
        asset: AssetBTC
      }
    ])
  },
  {
    ...assetsWBChainBNB,
    assetsWB: RD.success([
      {
        amount: baseAmount('1000000'),
        frozenAmount: O.none,
        asset: AssetBNB
      },
      {
        amount: baseAmount('300000000'),
        frozenAmount: O.none,
        asset: AssetETH
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
const pricePool = getRunePricePool(AssetRune67C)

storiesOf('Wallet/AssetsTableCollapsable', module).add('initial', () => {
  return (
    <AssetsTableCollapsable
      assetsWBChains={assetsWBChains}
      poolDetails={[]}
      selectAssetHandler={selectAssetHandler}
      pricePool={pricePool}
    />
  )
})
storiesOf('Wallet/AssetsTableCollapsable', module).add('loading', () => {
  return <AssetsTableCollapsable assetsWBChains={assetsWBChainsLoading} poolDetails={[]} pricePool={pricePool} />
})
storiesOf('Wallet/AssetsTableCollapsable', module).add('error', () => {
  return <AssetsTableCollapsable assetsWBChains={assetsWBChainsError} poolDetails={[]} pricePool={pricePool} />
})
