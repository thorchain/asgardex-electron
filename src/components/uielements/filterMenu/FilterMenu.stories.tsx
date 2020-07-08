import React from 'react'

import { storiesOf } from '@storybook/react'
import { assetAmount, assetToBase } from '@thorchain/asgardex-util'

import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import { ASSETS_MAINNET } from '../../../mock/assets'
import { AssetPair } from '../../../types/asgardex'
import AssetData from '../assets/assetData'
import FilterMenu from './FilterMenu'

storiesOf('Components/FilterMenu', module).add('coins example', () => {
  const filterFunction = (item: AssetPair, searchTerm: string) => {
    const symbol = item.asset.symbol?.toLowerCase() ?? ''
    return symbol.indexOf(searchTerm.toLowerCase()) === 0 ?? false
  }

  const cellRenderer = (data: AssetPair) => {
    const { asset, price } = data
    const node = <AssetData asset={asset} price={price} />
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
          { asset: ASSETS_MAINNET.RUNE, price: ONE_ASSET_BASE_AMOUNT },
          { asset: ASSETS_MAINNET.FTM, price: ONE_ASSET_BASE_AMOUNT },
          { asset: ASSETS_MAINNET.TOMO, price: ONE_ASSET_BASE_AMOUNT },
          { asset: ASSETS_MAINNET.BNB, price: assetToBase(assetAmount(0.00387)) }
        ] as AssetPair[]
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
