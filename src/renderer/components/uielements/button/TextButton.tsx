import React from 'react'

import { BaseButton, BaseButtonProps } from './BaseButton'
import type { Color } from './Button.types'

export type Props = BaseButtonProps & {
  color?: Color
}

export const TextButton: React.FC<Props> = (props): JSX.Element => {
  const { color = 'primary', disabled = false, className = '', children, ...otherProps } = props

  const textColor: Record<Color, string> = {
    primary: 'text-turquoise',
    warning: 'text-warning0',
    error: 'text-error0'
  }

  return (
    <BaseButton
      color={color}
      disabled={disabled}
      className={`
          ${textColor[color]}
          ${!disabled && 'hover:opacity-80'}
          'bg-transparent'
          ${className}
        `}
      {...otherProps}>
      {children}
    </BaseButton>
  )
}
