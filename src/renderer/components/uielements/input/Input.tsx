import React, { forwardRef, useCallback } from 'react'

import * as FP from 'fp-ts/lib/function'

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
  onEnter?: (value: string) => void
  onCancel?: FP.Lazy<void>
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref): JSX.Element => {
  const {
    id = 'input-id',
    size = 'normal',
    disabled = false,
    autoFocus = false,
    uppercase = true,
    error = '',
    onEnter = FP.constVoid,
    onCancel = FP.constVoid,
    className = '',
    ...otherProps
  } = props

  const onKeyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      if (e.key === 'Enter') {
        onEnter(value)
      }
      if (e.key === 'Escape') {
        onCancel()
      }
    },
    [onEnter, onCancel]
  )

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
            ${error ? 'ring-error0' : 'ring-gray1 dark:ring-gray1d'}
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
      onKeyDown={onKeyDownHandler}
      autoComplete="off"
      disabled={disabled}
      {...otherProps}
    />
  )
})
