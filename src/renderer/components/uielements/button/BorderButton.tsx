import React from 'react'

import { BaseButton, BaseButtonProps } from './BaseButton'
import type { Color, Size } from './Button.types'

export type Props = BaseButtonProps & {
  color?: Color
  transparent?: boolean
}

export const BorderButton: React.FC<Props> = (props): JSX.Element => {
  const {
    color = 'primary',
    size = 'normal',
    transparent = false,
    disabled = false,
    className = '',
    children,
    ...restProps
  } = props

  const borderColor: Record<Color, string> = {
    primary: 'border-turquoise',
    warning: 'border-warning0',
    error: 'border-error0'
  }

  const borderSize: Record<Size, string> = {
    small: 'border',
    normal: 'border-2',
    large: 'border-2'
  }

  const textColor: Record<Color, string> = {
    primary: 'text-turquoise',
    warning: 'text-warning0 dark:text-warning0d',
    error: 'text-error0 dark:text-error0d'
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
      ${borderSize[size]}
      bg-bg0 dark:bg-bg0d
        ${textColor[color]}
        ${borderColor[color]}
        ${transparent && 'bg-tranparent'}
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
