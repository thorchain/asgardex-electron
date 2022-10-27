import React, { useState, useCallback, useEffect } from 'react'

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import * as FP from 'fp-ts/function'

import { Color, Size } from './Button.types'
import { TextButton } from './TextButton'

export type Props = {
  color?: Color
  size?: Size
  clickHandler?: (checked: boolean) => void
  disabled?: boolean
  checked: boolean
  children: React.ReactNode
  className?: string
}

export const CheckButton: React.FC<Props> = (props): JSX.Element => {
  const {
    color = 'primary',
    size = 'normal',
    clickHandler = FP.constVoid,
    disabled,
    checked: checkedProp,
    className,
    children
  } = props

  const iconSize: Record<Size, string> = {
    small: 'w-10px h-10px',
    medium: 'w-[14px] h-[14px]',
    normal: 'w-[19px] h-[19px]',
    large: 'w-[24px] h-[24px]'
  }

  const borderColor: Record<Color, string> = {
    primary: 'border-turquoise',
    warning: 'border-warning0',
    error: 'border-error0',
    neutral: 'border-text0 dark:border-text0d'
  }
  const [checked, setChecked] = useState(checkedProp)

  // update internal state of `isChecked` whenever `checked` prop has been changed,
  // internal state won't be updated in other case
  useEffect(() => {
    setChecked(checkedProp)
  }, [checkedProp])

  const onClickHandler = useCallback(() => {
    const newValue = !checked
    setChecked(() => newValue)
    clickHandler(newValue)
  }, [checked, clickHandler])

  return (
    <TextButton
      color={color}
      size={size}
      onClick={onClickHandler}
      disabled={disabled}
      className={`w-min-auto !px-0 ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`${iconSize[size]} mr-5px`}>
          {checked ? (
            <CheckCircleIcon className={`h-full w-full`} />
          ) : (
            <div className={`h-full w-full rounded-full border ${borderColor[color]}`}></div>
          )}
        </div>
        {children}
      </div>
    </TextButton>
  )
}
