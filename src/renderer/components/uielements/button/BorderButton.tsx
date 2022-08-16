import React from 'react'

import { BaseButton, BaseButtonProps } from './BaseButton'
import { borderSize, dropShadow, borderColor } from './Button.shared'
import type { Color } from './Button.types'

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

  const textColor: Record<Color, string> = {
    primary: 'text-turquoise',
    warning: 'text-warning0 dark:text-warning0d',
    error: 'text-error0 dark:text-error0d',
    neutral: 'text-text0 dark:text-text0d'
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
