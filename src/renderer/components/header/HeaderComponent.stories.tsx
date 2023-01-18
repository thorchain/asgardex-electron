import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta, StoryFn } from '@storybook/react'
import * as O from 'fp-ts/lib/Option'

import { AssetRuneNative } from '../../../shared/utils/asset'
import * as AT from '../../storybook/argTypes'
import { HeaderComponent as Component, Props } from './HeaderComponent'

const Template: StoryFn<Props> = (args) => <Component {...args} />

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Header',
  argTypes: {
    network: AT.network,
    keystore: AT.keystore
  },
  args: {
    keystore: O.none,
    lockHandler: () => console.log('lockHandler'),
    pricePools: O.none,
    runePrice: RD.initial,
    reloadRunePrice: () => console.log('reload rune price'),
    volume24Price: RD.initial,
    reloadVolume24Price: () => console.log('reload volume24 price'),
    setSelectedPricePool: () => console.log('setSelectedPricePool'),
    selectedPricePoolAsset: O.some(AssetRuneNative),
    midgardStatus: RD.initial,
    mimir: RD.initial,
    midgardUrl: RD.success('midgard-url'),
    thorchainNodeUrl: 'thorchain-node-url',
    thorchainRpcUrl: 'thorchain-rpc-url',
    network: 'mainnet'
  }
}

export default meta
