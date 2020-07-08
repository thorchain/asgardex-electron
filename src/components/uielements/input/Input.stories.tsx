import React from 'react'

import { text, radios, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { Row } from 'antd'
import { SizeType } from 'antd/lib/config-provider/SizeContext'

import { Input, InputPassword, InputTextArea } from './Input.style'
import { Color } from './types'

type ColorOptions = {
  [key in Color]: Color
}

type SizeOptions = Record<NonNullable<SizeType>, NonNullable<SizeType>>

storiesOf('Components/Input', module)
  .addDecorator(withKnobs)
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
        <Input color="primary" size="small" value="this is text!" />
        <Input color="primary" size="middle" value="this is text!" />
        <Input color="primary" size="middle" typevalue="ghost" value="this is text!" />
        <Input color="primary" size="large" value="this is text!" />
        <Input color="success" size="large" value="this is text!" />
        <Input color="warning" size="large" value="this is text!" />
        <Input color="error" size="large" value="this is text!" />
        <InputTextArea typevalue={'normal'} color="error" size="large" value="this is text area!" />
        <InputPassword color="error" size="large" value="this is password!" />
      </Row>
    )
  })
  .add('properties', () => {
    const inputText = text('Input Text', 'text')
    const sizeOptions: SizeOptions = { small: 'small', middle: 'middle', large: 'large' }
    const colorOptions: ColorOptions = { primary: 'primary', success: 'success', warning: 'warning', error: 'error' }

    const size = radios('size', sizeOptions, 'middle')
    const color = radios('color', colorOptions, 'primary')
    return <Input color={color} size={size} value={inputText} />
  })
