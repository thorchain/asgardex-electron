import React, { forwardRef, useCallback } from 'react'

import * as FP from 'fp-ts/lib/function'

import type { Size } from './Input.types'

const sizeClasses: Record<Size, string> = {
  small: 'px-[3px] py-[1px] text-[11px]',
  normal: 'px-[6px] py-[3px] text-[14px]',
  large: 'px-[10px] py-[4px] text-[21px]',
  xlarge: 'px-[15px] py-[5px] text-[27px]'
}

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: Size // overridden
  id?: string
  error?: boolean
  uppercase?: boolean
  disabled?: boolean
  autoFocus?: boolean
  ghost?: boolean
  onEnter?: (value: string) => void
  onCancel?: FP.Lazy<void>
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref): JSX.Element => {
  const {
    id = 'input-id',
    size = 'normal',
    ghost = false,
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
            ${ghost ? 'ring-0' : 'ring-1'}
            focus:outline-none
            ${error ? 'ring-error0 dark:ring-error0d' : 'ring-gray1 dark:ring-gray1d'}
            ${error ? 'text-error0 dark:text-error0d' : 'text-text0 dark:text-text0d'}
            bg-bg0
            ${uppercase ? 'placeholder:uppercase' : ''}
             placeholder:text-gray-300 dark:bg-bg0d
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
