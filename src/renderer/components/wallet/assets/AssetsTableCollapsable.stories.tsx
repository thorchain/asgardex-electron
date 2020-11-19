import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { storiesOf } from '@storybook/react'
import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRune67C, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { getRunePricePool } from '../../../helpers/poolHelper'
import { ApiError, ChainBalance, AssetsWBChains, ErrorId } from '../../../services/wallet/types'
import { AssetsTableCollapsable } from './index'

const assetsWBChainRUNE: ChainBalance = {
  address: 'thor1766mazrxs5asuscepa227r6ekr657234f8p7nf',
  chain: 'THOR',
  balances: RD.initial
}

const assetsWBChainBNB: ChainBalance = {
  address: 'bnb1zzapwywxrxa2wyyrp93ls5l0a6ftxju5phmhu9',
  chain: 'BNB',
  balances: RD.initial
}

const assetsWBChainBTC: ChainBalance = {
  address: 'bc11766mazrxs5asuscepa227r6ekr657234f8p7nf',
  chain: 'BTC',
  balances: RD.initial
}

const assetsWBChains: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    balances: RD.success([
      {
        amount: baseAmount('12200000000'),
        asset: AssetRune67C
      }
    ])
  },
  {
    ...assetsWBChainBTC,
    balances: RD.success([
      {
        amount: baseAmount('1230000'),
        asset: AssetBTC
      }
    ])
  },
  {
    ...assetsWBChainBNB,
    balances: RD.success([
      {
        amount: baseAmount('1000000'),
        asset: AssetBNB
      },
      {
        amount: baseAmount('300000000'),
        asset: AssetETH
      }
    ])
  }
]

const assetsWBChainsLoading: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    balances: RD.pending
  },
  {
    ...assetsWBChainBTC,
    balances: RD.pending
  }
]
const apiError: ApiError = { errorId: ErrorId.GET_BALANCES, msg: 'error message' }
const assetsWBChainsError: AssetsWBChains = [
  {
    ...assetsWBChainRUNE,
    balances: RD.failure({ ...apiError, msg: 'RUNE error' })
  },
  {
    ...assetsWBChainBTC,
    balances: RD.failure({ ...apiError, msg: 'BTC error' })
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
