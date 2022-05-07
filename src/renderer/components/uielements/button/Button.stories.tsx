import React from 'react'

import { ArrowRightOutlined } from '@ant-design/icons'
// TODO (@veado) Replace knobs
// import { text, radios, boolean } from '@storybook/addon-knobs'
// import { RadiosTypeOptionsProp } from '@storybook/addon-knobs/dist/components/types'
import { storiesOf } from '@storybook/react'
import { Row } from 'antd'
import styled from 'styled-components'

import { Button } from './Button'
import { ButtonSize, ButtonColor, ButtonType } from './Button.types'

const StoryWrapper = styled.div`
  div.ant-row {
    display: flex;
    button {
      margin: 10px 10px;
    }
  }
`

storiesOf('Components/button/Button', module)
  .add('default', () => {
    return (
      <StoryWrapper>
        <Row>
          <Button sizevalue="small" color="primary">
            Primary Filled Small
          </Button>
          <Button sizevalue="small" color="primary" typevalue="outline">
            Primary Outlined Small
          </Button>
          <Button sizevalue="small" color="primary" typevalue="ghost">
            Primary Ghost Small
          </Button>
          <Button sizevalue="small" color="primary" typevalue="normal" focused>
            Primary Normal Small
          </Button>
          <Button sizevalue="small" color="primary" typevalue="underline">
            Primary Underline Small
          </Button>
        </Row>
        <Row>
          <Button sizevalue="normal" color="primary">
            Primary Filled Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="outline">
            Primary Outlined Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="ghost">
            Primary Ghost Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="normal" focused>
            Primary Normal Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="underline" focused>
            Primary Underline Normal
          </Button>
        </Row>
        <Row>
          <Button sizevalue="normal" color="primary" round="true">
            Primary Filled Round Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="outline" round="true">
            Primary Outlined Round Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="ghost" round="true">
            Primary Ghost Round Normal
          </Button>
          <Button sizevalue="normal" color="primary" typevalue="normal" focused round="true">
            Primary Normal Round
          </Button>
        </Row>
        <Row>
          <Button sizevalue="big" color="primary">
            Primary Filled Big
          </Button>
          <Button sizevalue="big" color="primary" typevalue="outline">
            Primary Outlined Big
          </Button>
          <Button sizevalue="big" color="primary" typevalue="ghost">
            Primary Ghost Big
            <ArrowRightOutlined />
          </Button>
          <Button sizevalue="big" color="primary" typevalue="normal" focused>
            Primary Normal Big
          </Button>
          <Button sizevalue="big" color="primary" typevalue="underline" focused>
            Primary Underline Big
          </Button>
        </Row>
        <Row>
          <Button sizevalue="big" color="success">
            success Filled
          </Button>
          <Button sizevalue="big" color="success" typevalue="outline">
            success Outlined
          </Button>
          <Button sizevalue="big" color="success" typevalue="ghost">
            success Ghost
            <ArrowRightOutlined />
          </Button>
          <Button sizevalue="big" color="success" typevalue="normal" focused>
            success Normal
          </Button>
        </Row>
        <Row>
          <Button sizevalue="big" color="warning">
            warning Filled
          </Button>
          <Button sizevalue="big" color="warning" typevalue="outline">
            warning Outlined
          </Button>
          <Button sizevalue="big" color="warning" typevalue="ghost">
            warning Ghost
            <ArrowRightOutlined />
          </Button>
          <Button sizevalue="big" color="warning" typevalue="normal" focused>
            warning Normal
          </Button>
        </Row>
        <Row>
          <Button sizevalue="big" color="error">
            error Filled
          </Button>
          <Button sizevalue="big" color="error" typevalue="outline">
            error Outlined
          </Button>
          <Button sizevalue="big" color="error" typevalue="ghost">
            Error Ghost
            <ArrowRightOutlined />
          </Button>
          <Button sizevalue="big" color="error" typevalue="normal" focused>
            Error Normal
          </Button>
        </Row>
      </StoryWrapper>
    )
  })
  .add('properties', () => {
    //   const buttonText = text('Button Text', 'button')
    //   const sizeOptions: RadiosTypeOptionsProp<ButtonSize> = {
    //     small: 'small',
    //     normal: 'normal',
    //     xnormal: 'xnormal',
    //     big: 'big'
    //   }

    //   const colorOptions: RadiosTypeOptionsProp<ButtonColor> = {
    //     primary: 'primary',
    //     success: 'success',
    //     warning: 'warning',
    //     error: 'error'
    //   }

    //   const typeOptions: RadiosTypeOptionsProp<ButtonType> = {
    //     default: 'default',
    //     outline: 'outline',
    //     normal: 'normal',
    //     ghost: 'ghost',
    //     transparent: 'transparent',
    //     underline: 'underline'
    //   }

    //   const size = radios('size', sizeOptions, 'normal')
    //   const color = radios('color', colorOptions, 'primary')
    //   const type = radios('type', typeOptions, 'default')
    //   const focused = boolean('focused', false)
    //   const loading = boolean('loading', false)

    const size: ButtonSize = 'normal'
    const color: ButtonColor = 'primary'
    const type: ButtonType = 'default'
    const focused = false
    const loading = false
    const buttonText = 'Button label'

    return (
      <Button sizevalue={size} color={color} typevalue={type} focused={focused} loading={loading}>
        {buttonText}
      </Button>
    )
  })
