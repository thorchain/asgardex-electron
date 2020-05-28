import React from 'react'

import { text, radios } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { Row } from 'antd'

import Input from './Input'
import { Color, Size } from './types'

type ColorOptions = {
  [key in Color]: Color
}

type SizeOptions = {
  [key in Size]: Size
}

storiesOf('Components/Input', module)
  .add('default', () => {
    return (
      <Row
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '300px',
          height: '300px'
        }}>
        <Input color="primary" sizevalue="small" value="this is text!" />
        <Input color="primary" sizevalue="normal" value="this is text!" />
        <Input color="primary" sizevalue="normal" typevalue="ghost" value="this is text!" />
        <Input color="primary" sizevalue="big" value="this is text!" />
        <Input color="success" sizevalue="big" value="this is text!" />
        <Input color="warning" sizevalue="big" value="this is text!" />
        <Input color="error" sizevalue="big" value="this is text!" />
      </Row>
    )
  })
  .add('properties', () => {
    const inputText = text('Input Text', 'text')
    const sizeOptions: SizeOptions = { small: 'small', normal: 'normal', big: 'big' }
    const colorOptions: ColorOptions = { primary: 'primary', success: 'success', warning: 'warning', error: 'error' }

    const size = radios('size', sizeOptions, 'normal')
    const color = radios('color', colorOptions, 'primary')
    return <Input color={color} sizevalue={size} value={inputText} />
  })
