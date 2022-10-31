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

import { AssetBUSDBD1 } from '../../../../const'
import * as AT from '../../../../storybook/argTypes'
import { AssetMenu as Component, Props } from './AssetMenu'

const assets = [AssetBTC, AssetBNB, AssetRuneNative, AssetETH, AssetLTC, AssetBCH, AssetDOGE, AssetBUSDBD1]

const Template = ({ network, onSelect, open, onClose, headline }: Props) => {
  const [asset, setAsset] = useState<Asset>(AssetBNB)
  const [openMenu, setOpenMenu] = useState(open)
  return (
    <Component
      asset={asset}
      assets={assets}
      open={openMenu}
      headline={headline}
      onSelect={(asset) => {
        onSelect(asset)
        setAsset(asset)
        setOpenMenu(false)
      }}
      onClose={() => {
        onClose()
        setOpenMenu(false)
      }}
      network={network}
    />
  )
}
export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetMenu',
  argTypes: {
    network: AT.network,
    onSelect: {
      action: 'onSelect'
    },
    onClose: {
      action: 'onClose'
    }
  },
  args: { network: 'mainnet', open: true, headline: 'Menu headline' },
  decorators: [
    (Story) => (
      <div className="flex min-h-full w-full bg-white">
        <Story />
      </div>
    )
  ]
}

export default meta
