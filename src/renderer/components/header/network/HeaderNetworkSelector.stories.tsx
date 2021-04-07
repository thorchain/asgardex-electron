import { Meta, Story } from '@storybook/react'
import { Network } from '@xchainjs/xchain-client'

import { HeaderNetwork } from './HeaderNetworkSelector'

export const Default: Story<{
  network: Network
  isDesktopView: boolean
  changeNetwork: () => void
  removeAllLedgerAddress: () => void
}> = ({ network, isDesktopView, changeNetwork, removeAllLedgerAddress }) => {
  return (
    <HeaderNetwork
      selectedNetwork={network}
      changeNetwork={changeNetwork}
      isDesktopView={isDesktopView}
      removeAllLedgerAddress={removeAllLedgerAddress}
    />
  )
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
  },
  removeAllLedgerAddress: {
    action: 'removeAllLedgerAddress'
  }
}

const meta: Meta = {
  component: Default,
  title: 'Header/NetworkSelector',
  argTypes: argTypes
}

export default meta
