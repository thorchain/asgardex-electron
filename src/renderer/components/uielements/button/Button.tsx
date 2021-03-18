import React from 'react'

import { ButtonWrapper } from './Button.style'
import { ButtonProps } from './Button.types'

export const Button: React.ForwardRefExoticComponent<ButtonProps> = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
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
        ref={ref}
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
)
