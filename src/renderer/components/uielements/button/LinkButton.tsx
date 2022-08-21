import React from 'react'

import type { Color, Size } from './Button.types'
import { TextButton, Props as TextButtonProps } from './TextButton'

export type Props = TextButtonProps & {
  size?: Size
}

export const LinkButton: React.FC<Props> = (props): JSX.Element => {
  const { color = 'primary', size = 'normal', disabled = false, className = '', children, ...otherProps } = props

  const decorationColor: Record<Color, string> = {
    primary: 'decoration-turquoise',
    warning: 'decoration--warning0',
    error: 'decoration--error0',
    neutral: 'decoration--text0 dark:decoration--text0d'
  }
  const decorationOffset: Record<Size, string> = {
    small: 'underline-offset-1',
    medium: 'underline-offset-1',
    normal: 'underline-offset-2',
    large: 'underline-offset-4'
  }

  const thickness: Record<Size, string> = {
    small: 'decoration-1',
    medium: 'decoration-1',
    normal: 'decoration-2',
    large: 'decoration-3'
  }

  return (
    <TextButton
      size={size}
      color={color}
      disabled={disabled}
      className={`
        underline
        decoration-solid
          ${thickness[size]}
          ${decorationOffset[size]}
          ${decorationColor[color]}
          ${!disabled && 'hover:text-opacity-80'}
          'bg-transparent'
          ${className}
        `}
      {...otherProps}>
      {children}
    </TextButton>
  )
}
