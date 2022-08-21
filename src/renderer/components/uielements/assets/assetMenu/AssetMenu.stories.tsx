import { ComponentMeta } from '@storybook/react'
import { AssetBNB, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import * as AT from '../../../../storybook/argTypes'
import { AssetMenu as Component } from './AssetMenu'

type Args = {
  withSearch: boolean
  network: Network
  onSelect: FP.Lazy<void>
}

const Template = ({ network, withSearch, onSelect }: Args) => (
  <Component
    withSearch={withSearch}
    asset={AssetBNB}
    assets={[AssetBNB, AssetBTC, AssetRuneNative]}
    onSelect={onSelect}
    searchDisable={[]}
    network={network}
  />
)
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetMenu',
  argTypes: {
    network: AT.network,
    onSelect: {
      action: 'onSelect'
    }
  },
  args: { network: 'mainnet', withSearch: false },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <Story />
      </div>
    )
  ]
}

export default meta
