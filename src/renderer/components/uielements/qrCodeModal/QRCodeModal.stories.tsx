import { ComponentMeta } from '@storybook/react'
import { AssetBNB } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../shared/api/types'
import { BNB_ADDRESS_MAINNET, BNB_ADDRESS_TESTNET } from '../../../../shared/mock/address'
import * as AT from '../../../storybook/argTypes'
import { QRCodeModal as Component } from './QRCodeModal'

type StoryArgs = {
  network: Network
  visible: boolean
  onOkHandler: FP.Lazy<void>
  onCancelHandler: FP.Lazy<void>
}

const Template = ({ network, visible, onCancelHandler, onOkHandler }: StoryArgs) => (
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

const meta: ComponentMeta<typeof Template> = {
  component: Component,
  title: 'Components/QRCodeModal',
  argTypes: {
    network: AT.network,
    onOkHandler: {
      action: 'onOkHandler'
    },
    onCancelHandler: {
      action: 'onCancelHandler'
    }
  },
  args: { network: 'mainnet', visible: true }
}

export default meta
