import React from 'react'

import { BaseButton, BaseButtonProps } from './BaseButton'
import type { Color, Size } from './Button.types'

export type Props = BaseButtonProps & {
  color?: Color
}

export const LinkButton: React.FC<Props> = (props): JSX.Element => {
  const { size = 'normal', color = 'primary', disabled = false, className = '', children, ...otherProps } = props

  const decorationColor: Record<Color, string> = {
    primary: 'decoration-turquoise',
    warning: 'decoration--warning0',
    error: 'decoration--error0'
  }
  const decorationOffset: Record<Size, string> = {
    small: 'underline-offset-1',
    normal: 'underline-offset-2',
    large: 'underline-offset-4'
  }

  const thickness: Record<Size, string> = {
    small: 'decoration-1',
    normal: 'decoration-2',
    large: 'decoration-3'
  }

  const textColor: Record<Color, string> = {
    primary: 'text-turquoise',
    warning: 'text-warning0',
    error: 'text-error0'
  }

  return (
    <BaseButton
      size={size}
      color={color}
      disabled={disabled}
      className={`
        underline
        decoration-solid
          ${thickness[size]}
          ${textColor[color]}
          ${decorationOffset[size]}
          ${decorationColor[color]}
          ${!disabled && 'hover:text-opacity-80'}
          'bg-transparent'
          ${className}
        `}
      {...otherProps}>
      {children}
    </BaseButton>
  )
}
