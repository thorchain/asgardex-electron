import React from 'react'

import { BaseButton, BaseButtonProps } from './BaseButton'
import * as S from './Button.shared'
import type { Color } from './Button.types'

export type Props = BaseButtonProps & {
  color?: Color
}

export const FlatButton: React.FC<Props> = (props): JSX.Element => {
  const { color = 'primary', size = 'normal', disabled = false, className = '', children, ...restProps } = props

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

  const borderColor = { ...S.borderColor, neutral: 'border-gray0 dark:border-gray0d' }

  return (
    <BaseButton
      size={size}
      disabled={disabled}
      className={`
      rounded-full
        ${textColor[color]}
        ${bgColor[color]}
        ${S.borderSize[size]}
        ${textColor[color]}
        ${borderColor[color]}
        ${!disabled && `hover:${S.dropShadow[size]}`}
        ${!disabled && 'hover:border-opacity-85'}
        ${!disabled && 'hover:scale-105'}
        ${className}
      `}
      {...restProps}>
      {children}
    </BaseButton>
  )
}
