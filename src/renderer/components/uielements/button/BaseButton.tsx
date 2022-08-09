import React from 'react'

import { LoadingIcon } from '../../icons'
import type { Size } from './Button.types'

export type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size
  loading?: boolean
}

export const BaseButton: React.FC<BaseButtonProps> = (props): JSX.Element => {
  const {
    size = 'normal',
    loading = false,
    className = '',
    disabled = false,
    type = 'button',
    children,
    ...restProps
  } = props

  const sizeClasses: Record<Size, string> = {
    small: 'px-4 py-1 text-11',
    normal: 'px-5 py-2 text-14',
    large: 'px-6 py-2 text-16'
  }

  const iconSize: Record<Size, string> = {
    small: 'w-10px h-10px',
    normal: 'w-[13px] h-[13px]',
    large: 'w-[17px] h-[17px]'
  }

  const iconMargin: Record<Size, string> = {
    small: 'mr-[6px]',
    normal: 'mr-[8px]',
    large: 'mr-[12px]'
  }

  return (
    <button
      disabled={disabled}
      type={type}
      className={`
      group
      flex appearance-none items-center
        ${disabled && 'opacity-70'}
      justify-center
        ${disabled && 'cursor-not-allowed'}
        font-main
        uppercase
        transition
        duration-300
        ease-in-out
        ${sizeClasses[size]}
        ${className}
      `}
      {...restProps}>
      {loading && (
        <LoadingIcon className={`${iconSize[size]} ${iconMargin[size]} animate-spin group-hover:opacity-70`} />
      )}
      {children}
    </button>
  )
}
