import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../shared/api/types'
import { BNB_ADDRESS_MAINNET, BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import { QRCodeModal as Component } from './QRCodeModal'

type StoryArgs = {
  network: Network
  visible: boolean
  onOkHandler: FP.Lazy<void>
  onCancelHandler: FP.Lazy<void>
}

const Template: Story<StoryArgs> = ({ network, visible, onCancelHandler, onOkHandler }) => (
  <Component
    asset={AssetBNB}
    address={network === 'testnet' ? BNB_ADDRESS_TESTNET : BNB_ADDRESS_MAINNET}
    network={network}
    visible={visible}
    onCancel={onCancelHandler}
    onOk={onOkHandler}
  />
)

export const Default = Template.bind({})
Default.args = { visible: true, network: 'mainnet' }

const meta: Meta<StoryArgs> = {
  component: Component,
  title: 'Components/QRCodeModal',
  argTypes: {
    network: {
      control: { type: 'radio', options: ['testnet', 'mainnet'] }
    },
    visible: {
      control: {
        type: 'boolean'
      }
    },
    onOkHandler: {
      action: 'onOkHandler'
    },
    onCancelHandler: {
      action: 'onCancelHandler'
    }
  }
}

export default meta
