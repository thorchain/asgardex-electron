import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { ONE_RUNE_BASE_AMOUNT } from '../../../../shared/mock/amount'
import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetWithAmount } from '../../../types/asgardex'
import { AssetData } from '../assets/assetData'
import { FilterMenu } from './FilterMenu'

storiesOf('Components/FilterMenu', module).add('coins example', () => {
  const filterFunction = (item: AssetWithAmount, searchTerm: string) => {
    const symbol = item.asset.symbol?.toLowerCase() ?? ''
    return symbol.indexOf(searchTerm.toLowerCase()) === 0 ?? false
  }

  const cellRenderer = (data: AssetWithAmount) => {
    const { asset, amount } = data
    const node = <AssetData asset={asset} price={amount} />
    return { key: asset?.symbol ?? '', node }
  }

  return (
    <FilterMenu
      searchEnabled
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      asset="TOMOB-1E1"
      data={
        [
          { asset: AssetRuneNative, amount: ONE_RUNE_BASE_AMOUNT },
          { asset: ASSETS_MAINNET.FTM, amount: assetToBase(assetAmount(1, 8)) },
          { asset: ASSETS_MAINNET.TOMO, amount: assetToBase(assetAmount(2, 8)) },
          { asset: AssetBNB, amount: assetToBase(assetAmount(0.00387, 8)) }
        ] as AssetWithAmount[]
      }
    />
  )
})
storiesOf('Components/FilterMenu', module).add('general use', () => {
  const filterFunction = (name: string, searchTerm: string) =>
    name.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ?? false

  return (
    <FilterMenu
      searchEnabled
      filterFunction={filterFunction}
      cellRenderer={(name) => ({
        key: `${Math.random()}-name`,
        node: <div>{name}</div>
      })}
      asset="paul"
      data={['John', 'Paul', 'George', 'Ringo']}
    />
  )
})
