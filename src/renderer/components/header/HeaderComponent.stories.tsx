import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta } from '@storybook/react'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { HeaderComponent as Component } from './HeaderComponent'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/Header',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    thorchainUrl: {
      name: 'thorchain url',
      control: {
        type: 'text'
      },
      defaultValue: 'thorchain.info'
    }
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
    inboundAddresses: RD.initial,
    mimir: RD.initial,
    midgardUrl: RD.initial
  }
}

export default meta
