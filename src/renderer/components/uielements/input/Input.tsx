import React, { forwardRef } from 'react'

import type { Size } from './Input.types'

const sizeClasses: Record<Size, string> = {
  small: 'px-[3px] py-[1px] text-[11px]',
  normal: 'px-[6px] py-[3px] text-[14px]',
  large: 'px-[10px] py-[4px] text-[16px]'
}

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: Size // overridden
  id?: string
  error?: boolean
  uppercase?: boolean
  disabled?: boolean
  autoFocus?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref): JSX.Element => {
  const {
    id = 'input-id',
    size = 'normal',
    disabled = false,
    autoFocus = false,
    uppercase = true,
    error = '',
    className = '',
    ...otherProps
  } = props

  return (
    <input
      ref={ref}
      id={id}
      autoFocus={autoFocus}
      className={`
          w-full
          appearance-none
          ring-1
            focus:outline-none
            ${error ? 'ring-error0' : 'ring-turquoise'}
            bg-bg0
            text-text0
            ${uppercase ? 'placeholder:uppercase' : ''}
             placeholder:text-gray-300 dark:bg-bg0d
            dark:text-text0d
            dark:placeholder:text-gray-400
            ${sizeClasses[size]}
            ${uppercase ? 'uppercase' : 'normal-case'}
            font-main
            ${disabled ? 'opacity-50' : 'opacity-100'}
            ${className}`}
      type="text"
      autoComplete="off"
      disabled={disabled}
      {...otherProps}
    />
  )
})
