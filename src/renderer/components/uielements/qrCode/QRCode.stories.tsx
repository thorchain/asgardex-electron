import React from 'react'

import { Story } from '@storybook/react'

import { QRCode } from './QRCode'

export const Default: Story<{
  text: string
}> = ({ text }) => {
  return <QRCode text={text} qrError={'error for qr generation'} />
}

Default.args = {
  text: 'test address here'
}

export default {
  title: 'QrCode',
  component: QRCode
}
