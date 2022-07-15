import { ComponentMeta } from '@storybook/react'

import { QRCode } from './QRCode'

const meta: ComponentMeta<typeof QRCode> = {
  component: QRCode,
  title: 'QrCode',
  argTypes: {
    text: {
      control: 'text',
      defaultValue: 'test address here'
    }
  },
  args: {
    qrError: 'error for qr generation'
  }
}

export default meta
