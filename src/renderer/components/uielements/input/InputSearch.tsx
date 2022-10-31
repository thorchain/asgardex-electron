import React, { forwardRef, useCallback, useState } from 'react'

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import * as FP from 'fp-ts/lib/function'

import { emptyString } from '../../../helpers/stringHelper'
import { Size } from '../input'
import { Input, InputProps } from './Input'

export type Props = { classNameInput?: string; onSearch?: (searchTxt: string) => void } & Omit<InputProps, 'uppercase'>

export const InputSearch = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
  const {
    id = 'input-search',
    size = 'normal',
    disabled = false,
    error = false,
    onChange = FP.constVoid,
    onEnter = FP.constVoid,
    onCancel = FP.constVoid,
    onSearch = (_: string) => {},
    className = '',
    classNameInput = '',
    ...otherProps
  } = props

  const [searchTxt, setSearchTxt] = useState(emptyString)

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value
      setSearchTxt(value)
      onChange(event)
    },
    [onChange]
  )

  const onCancelHandler = useCallback(() => {
    setSearchTxt(emptyString)
    onCancel()
    onSearch(emptyString)
  }, [onCancel, onSearch])

  const onEnterHandler = useCallback(
    (value: string) => {
      onSearch(value)
      onEnter(value)
    },
    [onSearch, onEnter]
  )

  const iconSize: Record<Size, string> = {
    small: 'h-[12px] w-[12px]',
    normal: 'h-20px w-20px',
    large: 'h-20px w-20px',
    xlarge: 'h-20px w-20px'
  }

  const iconOffsetL: Record<Size, string> = {
    small: 'left-[3px]',
    normal: 'left-5px',
    large: 'left-5px',
    xlarge: 'left-5px'
  }

  const iconOffsetR: Record<Size, string> = {
    small: 'right-[3px]',
    normal: 'right-5px',
    large: 'right-5px',
    xlarge: 'right-5px'
  }

  const inputOffsetX: Record<Size, string> = {
    small: '!px-20px',
    normal: '!px-30px',
    large: '!px-30px',
    xlarge: '!px-30px'
  }

  return (
    <div className={`relative  ${className}`}>
      <MagnifyingGlassIcon
        className={`absolute top-[50%] ${iconOffsetL[size]} ${
          iconSize[size]
        } translate-y-[-50%] text-gray2 dark:text-gray2
            ${error ? 'text-error0' : ''}
            ${disabled ? 'opacity-50' : ''}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
      />
      <XMarkIcon
        className={`absolute top-[50%]  ${iconOffsetR[size]} ${
          iconSize[size]
        } translate-y-[-50%] text-gray2 dark:text-gray2
          ${!searchTxt ? 'hidden' : ''}
          ${disabled ? 'opacity-50' : ''}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}
        onClick={() => {
          onCancelHandler()
        }}
      />
      <Input
        className={`${inputOffsetX[size]} placeholder:uppercase ${classNameInput}`}
        ref={ref}
        error={!!error}
        id={id}
        disabled={disabled}
        type="text"
        size={size}
        autoComplete="off"
        value={searchTxt}
        onCancel={onCancelHandler}
        onEnter={onEnterHandler}
        onChange={onChangeHandler}
        uppercase={false}
        {...otherProps}
      />
    </div>
  )
})
