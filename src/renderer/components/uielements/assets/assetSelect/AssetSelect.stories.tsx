import { ComponentMeta } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { AssetSelect } from './AssetSelect'

const assets = [AssetBTC, AssetBNB, AssetRuneNative]

type Args = {
  withSearch: boolean
  network: Network
  onSelect: FP.Lazy<void>
}

const Template = ({ network, withSearch, onSelect }: Args) => (
  <AssetSelect
    asset={AssetBNB}
    withSearch={withSearch}
    assets={assets}
    onSelect={onSelect}
    searchDisable={[]}
    network={network}
  />
)

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetSelect',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    withSearch: {
      name: 'with search',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    onSelect: {
      action: 'onSelect'
    }
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
