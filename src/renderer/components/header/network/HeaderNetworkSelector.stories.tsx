import { Meta, Story } from '@storybook/react'
import { Network } from '@xchainjs/xchain-client'

import { HeaderNetworkSelector } from './HeaderNetworkSelector'

export const Default: Story<{
  network: Network
  isDesktopView: boolean
  changeNetwork: () => void
}> = ({ network, isDesktopView, changeNetwork }) => {
  return <HeaderNetworkSelector selectedNetwork={network} changeNetwork={changeNetwork} isDesktopView={isDesktopView} />
}

Default.args = { network: 'mainnet', isDesktopView: false }

const argTypes = {
  network: {
    control: {
      type: 'select',
      options: ['testnet', 'chaosnet', 'mainnet']
    }
  },
  isDesktopView: {
    control: {
      type: 'boolean'
    }
  },
  changeNetwork: {
    action: 'changeNetwork'
  }
}

const meta: Meta = {
  component: Default,
  title: 'Header/NetworkSelector',
  argTypes: argTypes
}

export default meta
