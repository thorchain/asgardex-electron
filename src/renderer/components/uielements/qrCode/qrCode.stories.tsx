import React from 'react'

import { Story } from '@storybook/react'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { QrCode } from './qrCode'

export const Default: Story<{
  text: string
}> = ({ text }) => {
  return (
    <QrCode
      text={FP.pipe(
        text,
        O.fromPredicate((t) => !!t)
      )}
      noDataError={'no data error'}
      qrError={'error for qr generation'}
    />
  )
}

Default.args = {
  text: 'test address here'
}

export default {
  title: 'QrCode',
  component: QrCode
}
