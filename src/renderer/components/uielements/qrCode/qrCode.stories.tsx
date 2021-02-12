import React from 'react'

import { Story } from '@storybook/react'

import { QrCode } from './qrCode'

export const Default: Story<{
  text: string
}> = ({ text }) => {
  return <QrCode text={text} qrError={'error for qr generation'} />
}

Default.args = {
  text: 'test address here'
}

export default {
  title: 'QrCode',
  component: QrCode
}
