import { ComponentMeta } from '@storybook/react'
import { AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'

import { AssetBUSDBAF } from '../../../const'
import { PricePoolAsset } from '../../../views/pools/Pools.types'
import { HeaderPriceSelector as Component } from './HeaderPriceSelector'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/HeaderPriceSelector',
  argTypes: {
    isDesktopView: {
      name: 'isDesktopView',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  },
  args: {
    assets: [AssetRuneNative, AssetBTC, AssetETH, AssetBUSDBAF],
    changeHandler: (asset: PricePoolAsset) => console.log(`changed: ${asset}`),
    selectedAsset: O.some(AssetBUSDBAF)
  }
}

export default meta
