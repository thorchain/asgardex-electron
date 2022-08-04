import React, { forwardRef, useState } from 'react'

import { EyeHideIcon, EyeIcon } from '../../icons'
import type { Size } from './Input.types'

const sizeClasses: Record<Size, string> = {
  small: 'px-2 py-1 text-sm',
  normal: 'px-4 py-2 text-normal',
  large: 'px-8 py-3 text-lg'
}

export type PasswordProps = {
  size: Size
  id?: string
  error?: string
  disabled?: boolean
  autoFocus?: boolean
} & React.HTMLAttributes<HTMLInputElement>

export const InputPassword = forwardRef<HTMLInputElement, PasswordProps>((props, ref): JSX.Element => {
  const {
    id = 'input-pw',
    size = 'normal',
    disabled = false,
    autoFocus = false,
    error = '',
    className = '',
    ...otherProps
  } = props

  const [showPw, setShowPw] = useState(false)

  const Icon = showPw ? EyeIcon : EyeHideIcon

  return (
    <div className={`${disabled ? 'opacity-50' : ''} ${className}`}>
      <div className="relative">
        <div className="bg:bg0 dark:bg:bg0d absolute right-0 flex h-full cursor-pointer items-center px-10px">
          <Icon
            className={`h-20px w-20px
            ${error ? 'text-error0' : 'text-turquoise'}`}
            onClick={() => {
              setShowPw((current) => !current)
            }}
          />
        </div>
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
            `}
          type={showPw ? 'text' : 'password'}
          autoComplete="off"
          {...otherProps}
        />
      </div>
      {error && <p className="mt-2 font-main text-sm uppercase text-error0">{error}</p>}
    </div>
  )
})
