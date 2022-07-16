import { ComponentMeta } from '@storybook/react'
import { AssetBCH, AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import * as AT from '../../../../storybook/argTypes'
import { AssetIcon as Component } from './AssetIcon'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/AssetIcon',
  argTypes: {
    network: AT.network,
    size: {
      name: 'size',
      control: {
        type: 'select',
        options: ['small', 'normal', 'large', 'big']
      }
    },
    asset: {
      name: 'asset',
      options: ['RUNE', 'BTC', 'BNB', 'ETH', 'BCH'],
      mapping: {
        RUNE: AssetRuneNative,
        BTC: AssetBTC,
        BNB: AssetBNB,
        BCH: AssetBCH,
        ETH: AssetETH
      }
    }
  },
  args: { network: 'mainnet', asset: AssetBTC, size: 'normal' }
}

export default meta
