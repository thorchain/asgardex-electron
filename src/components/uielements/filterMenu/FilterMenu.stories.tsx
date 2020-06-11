import React from 'react'

import { storiesOf } from '@storybook/react'
import { bn } from '@thorchain/asgardex-util'

import { getTickerFormat } from '../../../helpers/stringHelper'
import { AssetPair, Nothing } from '../../../types/asgardex.d'
import CoinData from '../coins/coinData'
import FilterMenu from './FilterMenu'

const filterFunction = (item: AssetPair, searchTerm: string) => {
  const tokenName = getTickerFormat(item.asset)
  if (tokenName === Nothing) return false
  return tokenName?.indexOf(searchTerm.toLowerCase()) === 0
}

const cellRenderer = (data: AssetPair) => {
  const { asset: key, price } = data
  const tokenName = getTickerFormat(key)
  const node = <CoinData asset={tokenName || ''} price={price} />
  return { key, node }
}

storiesOf('Components/FilterMenu', module).add('coins example', () => {
  return (
    <FilterMenu
      searchEnabled
      filterFunction={filterFunction}
      cellRenderer={cellRenderer}
      asset="TOMOB-1E1"
      data={[
        { asset: 'FSN-F1B', price: bn(1) },
        { asset: 'FTM-585', price: bn(1) },
        { asset: 'LOK-3C0', price: bn(0) },
        { asset: 'TCAN-014', price: bn(1) },
        { asset: 'TOMOB-1E1', price: bn(1) },
        { asset: 'BNB', price: bn(0.00387) }
      ]}
    />
  )
})
storiesOf('Components/FilterMenu', module).add('general use', () => {
  return (
    <FilterMenu
      searchEnabled
      filterFunction={filterFunction}
      cellRenderer={({ asset }) => ({
        key: `${Math.random()}-name`,
        node: <div>{asset}</div>
      })}
      asset="paul"
      data={[
        { asset: 'John', price: bn(1) },
        { asset: 'Paul', price: bn(2) },
        { asset: 'George', price: bn(3) },
        { asset: 'Ringo', price: bn(4) }
      ]} // AssetPair[]
    />
  )
})
