import React from 'react'

import { LoadingIcon } from '../../icons'
import type { Size, Font } from './Button.types'

export type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size
  loading?: boolean
  uppercase?: boolean
  font?: Font
}

export const BaseButton: React.FC<BaseButtonProps> = (props): JSX.Element => {
  const {
    size = 'normal',
    loading = false,
    className = '',
    disabled = false,
    type = 'button',
    font = 'normal',
    uppercase = true, // by default all labels are uppercase in ASDGX
    children,
    ...restProps
  } = props

  const sizeClasses: Record<Size, string> = {
    small: 'px-[10px] py-[1px] text-[10px]',
    medium: 'px-[12px] py-[2px] text-[12px]',
    normal: 'px-[15px] py-[3px] text-[14px]',
    large: 'px-[20px] py-[4px] text-[16px]'
  }

  const iconSize: Record<Size, string> = {
    small: 'w-10px h-10px',
    medium: 'w-[11px] h-[11px]',
    normal: 'w-[14px] h-[14px]',
    large: 'w-[17px] h-[17px]'
  }

  const iconMargin: Record<Size, string> = {
    small: 'mr-[4px]',
    medium: 'mr-[6px]',
    normal: 'mr-[8px]',
    large: 'mr-[12px]'
  }

  const fontFamily: Record<Font, string> = {
    normal: 'font-main',
    semi: 'font-mainSemiBold',
    bold: 'font-mainBold'
  }

  return (
    <button
      disabled={disabled}
      type={type}
      className={`
      group
      flex appearance-none items-center
        ${disabled ? 'opacity-60' : 'opcacity-100'}
      justify-center
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${fontFamily[font]}
        ${uppercase ? 'uppercase' : 'normal-case'}
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
