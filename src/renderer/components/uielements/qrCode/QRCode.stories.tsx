import React from 'react'

import { ComponentMeta, ComponentStoryFn } from '@storybook/react'

import { BNB_ADDRESS_MAINNET } from '../../../../shared/mock/address'
import { QRCode as Component } from './QRCode'

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/QrCode'
}

export default meta

const Template: ComponentStoryFn<typeof Component> = (args) => <Component {...args} />

export const Default = Template.bind({})

Default.args = {
  qrError: 'error for qr generation',
  text: BNB_ADDRESS_MAINNET
}
