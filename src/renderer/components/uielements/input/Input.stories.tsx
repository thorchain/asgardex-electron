import React from 'react'

// TODO (@veado) Replace knobs
// import { text, radios, withKnobs } from '@storybook/addon-knobs'
// import { RadiosTypeOptionsProp } from '@storybook/addon-knobs/dist/components/types'
import { storiesOf } from '@storybook/react'
import { Row } from 'antd'
import { SizeType } from 'antd/lib/config-provider/SizeContext'

import { Input, InputPassword, InputTextArea } from './Input.styles'
import { Color } from './Input.types'

storiesOf('Components/Input', module)
  // .addDecorator(withKnobs)
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
    // const inputText = text('Input Text', 'text')
    // const sizeOptions: RadiosTypeOptionsProp<SizeType> = { small: 'small', middle: 'middle', large: 'large' }
    // const colorOptions: RadiosTypeOptionsProp<Color> = {
    //   primary: 'primary',
    //   success: 'success',
    //   warning: 'warning',
    //   error: 'error'
    // }

    // const size = radios('size', sizeOptions, 'middle')
    // const color = radios('color', colorOptions, 'primary')
    const size: SizeType = 'middle'
    const color: Color = 'primary'
    const inputText = 'Input Text'

    return <Input color={color} size={size} value={inputText} />
  })
