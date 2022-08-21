import { ComponentMeta, StoryFn } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { ONE_RUNE_BASE_AMOUNT } from '../../../../shared/mock/amount'
import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AssetWithAmount } from '../../../types/asgardex'
import { AssetData } from '../assets/assetData'
import { FilterMenu as Component, Props as ComponentProps } from './FilterMenu'

const coinsProps: ComponentProps<AssetWithAmount> = {
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

type ArgTypes = { searchEnabled: boolean }

const Template: StoryFn<ArgTypes> = (args) => <Component {...args} {...coinsProps} />
export const Default = Template.bind({})

// Coins example
const Coins: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/FilterMenu',
  argTypes: {
    onSelect: { action: 'onSelect' },
    closeMenu: { actioin: 'closeMenu' }
  },
  args: {
    searchEnabled: true
  }
}

export default Coins

// General (string) example
const generalProps: ComponentProps<string> = {
  filterFunction: (name: string, searchTerm: string) =>
    name.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ?? false,

  cellRenderer: (name: string) => ({
    key: `${Math.random()}-name`,
    node: <div>{name}</div>
  }),
  asset: 'paul',
  data: ['John', 'Paul', 'George', 'Ringo']
}

const Template2: StoryFn<ArgTypes> = (args) => <Component {...args} {...generalProps} />
export const General = Template2.bind({})
