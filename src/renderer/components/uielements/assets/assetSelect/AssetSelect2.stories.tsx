import { useState } from 'react'

import { ComponentMeta } from '@storybook/react'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetRuneNative
} from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { AssetBUSDBD1 } from '../../../../const'
import * as AT from '../../../../storybook/argTypes'
import { AssetSelect2 as Component } from './AssetSelect2'

const assets = [AssetBTC, AssetBNB, AssetRuneNative, AssetETH, AssetLTC, AssetBCH, AssetDOGE, AssetBUSDBD1]

type Args = {
  withSearch: boolean
  network: Network
  onSelect: (asset: Asset) => void
}

const Template = ({ network, withSearch, onSelect }: Args) => {
  const [asset, setAsset] = useState<Asset>(AssetBNB)
  return (
    <Component
      asset={asset}
      withSearch={withSearch}
      assets={assets}
      onSelect={(asset) => {
        onSelect(asset)
        setAsset(asset)
      }}
      searchDisable={[]}
      network={network}
    />
  )
}
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetSelect2',
  argTypes: {
    network: AT.network,
    onSelect: {
      action: 'onSelect'
    }
  },
  args: { network: 'mainnet', withSearch: false },
  decorators: [
    (Story) => (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white">
        <h1>Random headline</h1>
        <p>Some random text</p>
        <Story />
      </div>
    )
  ]
}

export default meta
