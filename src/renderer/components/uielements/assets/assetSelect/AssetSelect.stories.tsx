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
import { AssetSelect as Component } from './AssetSelect'

const assets = [AssetBTC, AssetBNB, AssetRuneNative, AssetETH, AssetLTC, AssetBCH, AssetDOGE, AssetBUSDBD1]

type Args = {
  network: Network
  dialogHeadline: string
  onSelect: (asset: Asset) => void
}

const Template = ({ network, onSelect, dialogHeadline }: Args) => {
  const [asset, setAsset] = useState<Asset>(AssetBNB)
  return (
    <Component
      asset={asset}
      assets={assets}
      onSelect={(asset) => {
        onSelect(asset)
        setAsset(asset)
      }}
      dialogHeadline={dialogHeadline}
      network={network}
    />
  )
}
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetSelect',
  argTypes: {
    network: AT.network,
    onSelect: {
      action: 'onSelect'
    }
  },
  args: { network: 'mainnet', dialogHeadline: 'Change asset' },
  decorators: [
    (Story) => (
      <div className="flex min-h-full w-full flex-col items-center justify-center bg-white">
        <h1 className="uppercase text-gray2">Random headline</h1>
        <p className="uppercase text-gray1">Some random text</p>
        <Story />
      </div>
    )
  ]
}

export default meta
