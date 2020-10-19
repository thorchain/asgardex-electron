import React from 'react'

import { ButtonProps } from 'antd/lib/button'

import { ButtonWrapper } from './Button.style'
import { ButtonColor, ButtonSize, ButtonWeight, ButtonType, ButtonRound } from './Button.types'

type ComponentProps = {
  sizevalue?: ButtonSize
  color?: ButtonColor
  weight?: ButtonWeight
  typevalue?: ButtonType
  focused?: boolean
  round?: ButtonRound
  className?: string
}

export type Props = ComponentProps & ButtonProps

export const Button: React.FC<Props> = (props): JSX.Element => {
  const {
    children,
    sizevalue = 'normal',
    color = 'primary',
    typevalue = 'default',
    weight = '500',
    round = 'false',
    focused = false,
    className = '',
    ...otherProps
  } = props

  const focusedStyle = focused ? 'focused' : ''

  return (
    <ButtonWrapper
      className={`${className} btn-wrapper ${focusedStyle}`}
      type="primary"
      weight={weight}
      color={color}
      sizevalue={sizevalue}
      typevalue={typevalue}
      round={round}
      {...otherProps}>
      {children}
      {props.typevalue === 'normal' && <div className="borderBottom" />}
    </ButtonWrapper>
  )
}
