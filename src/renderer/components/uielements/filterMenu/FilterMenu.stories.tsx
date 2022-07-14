import React from 'react'

import { ComponentMeta, ComponentStoryObj } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { ONE_RUNE_BASE_AMOUNT } from '../../../../shared/mock/amount'
import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetWithAmount } from '../../../types/asgardex'
import { AssetData } from '../assets/assetData'
import { FilterMenu as Component, Props as ComponentProps } from './FilterMenu'

const _coinsProps: ComponentProps<AssetWithAmount> = {
  filterFunction: (item: AssetWithAmount, searchTerm: string) => {
    const symbol = item.asset.symbol?.toLowerCase() ?? ''
    return symbol.indexOf(searchTerm.toLowerCase()) === 0 ?? false
  },
  cellRenderer: (data: AssetWithAmount) => {
    const { asset, amount } = data
    const node = <AssetData asset={asset} price={amount} network="testnet" />
    return { key: asset?.symbol ?? '', node }
  },
  asset: 'TOMOB-1E1',
  data: [
    { asset: AssetRuneNative, amount: ONE_RUNE_BASE_AMOUNT },
    { asset: ASSETS_MAINNET.FTM, amount: assetToBase(assetAmount(1, 8)) },
    { asset: ASSETS_MAINNET.TOMO, amount: assetToBase(assetAmount(2, 8)) },
    { asset: AssetBNB, amount: assetToBase(assetAmount(0.00387, 8)) }
  ] as AssetWithAmount[]
}

// Coins example
const Coins: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/FilterMenu',
  argTypes: {
    searchEnabled: {
      name: 'enabled',
      control: {
        type: 'boolean'
      },
      defaultValue: true
    }
  }
  // TODO (@veado) Fix props Props<`unknown`> type
  // args: coinsProps
}

export default Coins

// General (string) example
const _generalProps: ComponentProps<string> = {
  filterFunction: (name: string, searchTerm: string) =>
    name.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ?? false,

  cellRenderer: (name: string) => ({
    key: `${Math.random()}-name`,
    node: <div>{name}</div>
  }),
  asset: 'paul',
  data: ['John', 'Paul', 'George', 'Ringo']
}

export const General: ComponentStoryObj<typeof Component> = {
  // TODO (@veado) Fix props Props<`unknown`> type
  // args: generalProps
}
