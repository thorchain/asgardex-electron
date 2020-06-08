import React from 'react'

import { ArrowRightOutlined } from '@ant-design/icons'
import { text, radios, boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { Row } from 'antd'
import styled from 'styled-components'

import Button from './button'
import { ButtonSize, ButtonColor, ButtonType } from './types'

type SizeOption = {
  [key in ButtonSize]: ButtonSize
}

type ColorOption = {
  [key in ButtonColor]: ButtonColor
}

type TypeOption = {
  [key in ButtonType]: ButtonType
}

const StoryWrapper = styled.div`
  div.ant-row {
    display: flex;
    button {
      margin: 10px 10px;
    }
  }
`

storiesOf('Components/Button', module)
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
    const buttonText = text('Button Text', 'button')
    const sizeOptions: SizeOption = {
      small: 'small',
      normal: 'normal',
      big: 'big'
    }

    const colorOptions: ColorOption = {
      primary: 'primary',
      success: 'success',
      warning: 'warning',
      error: 'error'
    }

    const typeOptions: TypeOption = {
      default: 'default',
      outline: 'outline',
      normal: 'normal',
      ghost: 'ghost'
    }

    const size = radios('size', sizeOptions, 'normal')
    const color = radios('color', colorOptions, 'primary')
    const type = radios('type', typeOptions, 'default')
    const focused = boolean('focused', false)

    return (
      <Button sizevalue={size} color={color} typevalue={type} focused={focused}>
        {buttonText}
      </Button>
    )
  })
