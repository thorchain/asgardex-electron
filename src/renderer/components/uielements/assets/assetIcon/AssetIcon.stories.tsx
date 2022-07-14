import { ComponentMeta } from '@storybook/react'
import { AssetBCH, AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '@xchainjs/xchain-util'

import { AssetIcon as Component } from './AssetIcon'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/AssetIcon',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    size: {
      name: 'size',
      control: {
        type: 'select',
        options: ['small', 'normal', 'large', 'big']
      },
      defaultValue: 'normal'
    },
    asset: {
      name: 'asset',
      control: {
        type: 'select',
        options: ['RUNE', 'BTC', 'BNB', 'ETH', 'BCH'],
        mapping: {
          RUNE: AssetRuneNative,
          BTC: AssetBTC,
          BNB: AssetBNB,
          BCH: AssetBCH,
          ETH: AssetETH
        }
      },
      defaultValue: 'BTC'
    }
  }
}

export default meta
