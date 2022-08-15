import React from 'react'

import { BaseButton, BaseButtonProps } from './BaseButton'
import type { Color, Size } from './Button.types'

export type Props = BaseButtonProps & {
  color?: Color
}

export const FlatButton: React.FC<Props> = (props): JSX.Element => {
  const { color = 'primary', size = 'normal', disabled = false, className = '', children, ...restProps } = props

  const borderColor: Record<Color, string> = {
    primary: 'border-turquoise',
    warning: 'border-warning0',
    error: 'border-error0',
    neutral: 'border-text0 dark:border-text0d'
  }

  const borderSize: Record<Size, string> = {
    small: 'border',
    normal: 'border-2',
    large: 'border-2'
  }

  const bgColor: Record<Color, string> = {
    primary: 'bg-turquoise',
    warning: 'bg-warning0 dark:bg-warning0d',
    error: 'bg-error0 dark:bg-error0d',
    neutral: 'bg-gray0 dark:bg-gray0d'
  }

  const textColor: Record<Color, string> = {
    primary: 'text-white',
    warning: 'text-white',
    error: 'text-white',
    neutral: 'text-text0 dark:text-text0d'
  }

  const dropShadow: Record<Size, string> = {
    small: 'drop-shadow-lg',
    normal: 'drop-shadow-lg',
    large: 'drop-shadow-lg'
  }

  return (
    <BaseButton
      size={size}
      disabled={disabled}
      className={`
      rounded-full
        ${textColor[color]}
        ${bgColor[color]}
        ${borderSize[size]}
        ${textColor[color]}
        ${borderColor[color]}
        ${!disabled && `hover:${dropShadow[size]}`}
        ${!disabled && 'hover:border-opacity-85'}
        ${!disabled && 'hover:scale-105'}
        ${className}
      `}
      {...restProps}>
      {children}
    </BaseButton>
  )
}
