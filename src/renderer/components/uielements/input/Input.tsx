import React, { forwardRef } from 'react'

import type { Size } from './Input.types'

const sizeClasses: Record<Size, string> = {
  small: 'px-[3px] py-[1px] text-[11px]',
  normal: 'px-[5px] py-[3px] text-[14px]',
  large: 'px-[10px] py-[4px] text-[16px]'
}

export type InputProps = {
  size?: Size
  id?: string
  error?: string
  disabled?: boolean
  autoFocus?: boolean
  classNameInput?: string
  classNameError?: string
} & React.HTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref): JSX.Element => {
  const {
    id = 'input-id',
    size = 'normal',
    disabled = false,
    autoFocus = false,
    error = '',
    className = '',
    classNameInput = '',
    classNameError = '',
    ...otherProps
  } = props

  return (
    <div className={`${disabled ? 'opacity-50' : ''} ${className}`}>
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
            placeholder:uppercase placeholder:text-gray-300 dark:bg-bg0d
            dark:text-text0d
            dark:placeholder:text-gray-400
            ${sizeClasses[size]}
            font-main
            ${classNameInput}
            `}
        type="text"
        autoComplete="off"
        {...otherProps}
      />
      {error && <p className={`mt-2 font-main text-sm uppercase text-error0 ${classNameError}`}>{error}</p>}
    </div>
  )
})
