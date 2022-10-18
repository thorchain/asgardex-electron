import React, { useRef, useCallback, useState } from 'react'

import { assetAmount, assetToBase, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'

import { FixmeType } from '../../../../types/asgardex'
import { TooltipAddress } from '../../common/Common.styles'
import { InputBigNumber } from '../../input'

export type Props = {
  title: string
  titleTooltip?: string
  amount: BaseAmount
  disabled?: boolean
  showError?: boolean
  onChange?: (value: BaseAmount) => void
  onBlur?: FP.Lazy<void>
  onFocus?: FP.Lazy<void>
  className?: string
  asLabel?: boolean
}

/**
 * Wrapper around `InputBigNumber` component
 *
 * For input values, it takes and returns `BaseAmount`. It converts `BaseAmount` -> `AssetAmount` and vice versa,
 * to display and format values in `InputBigNumber` similar to values of `AssetAmount`
 *
 * Decimal of `InputBigNumber` depends on `decimal` of given `amount`.
 */
export const AssetInput: React.FC<Props> = (props): JSX.Element => {
  const {
    title,
    titleTooltip = '',
    amount,
    disabled = false,
    showError = false,
    className = '',
    asLabel = false,
    onChange = FP.constVoid,
    onBlur = FP.constVoid,
    onFocus = FP.constVoid
  } = props

  const inputRef = useRef<FixmeType>()

  const [focused, setFocused] = useState(false)

  const onChangeHandler = useCallback(
    (value: BigNumber) => {
      onChange(assetToBase(assetAmount(value, amount.decimal)))
    },
    [amount.decimal, onChange]
  )

  const handleClickWrapper = useCallback(() => {
    inputRef.current?.firstChild?.focus()
  }, [])

  const titleClassName = `absolute left-[10px] top-[-15px] p-5px mb-[2px] cursor-default bg-bg0 dark:bg-bg0d font-main text-[14px]
    ${showError ? 'text-error0 dark:text-error0d' : focused ? 'text-turquoise' : 'text-gray2 dark:text-gray2d'}
    `
  const Title = () => <p className={titleClassName}>{title}</p>

  const TitleWithTooltip = () => (
    <TooltipAddress title={titleTooltip}>
      <p className={titleClassName}>{title}</p>
    </TooltipAddress>
  )

  const onFocusHandler = useCallback(() => {
    setFocused(true)
    onFocus()
  }, [onFocus])

  const onBlurHandler = useCallback(() => {
    setFocused(false)
    onBlur()
  }, [onBlur])

  return (
    <div
      className={`
      relative
      flex min-w-[212px] flex-col
      ${
        showError
          ? 'border-error0 dark:border-error0d'
          : focused
          ? 'border-turquoise'
          : 'border-gray0 dark:border-gray0d'
      }
      rounded-lg border-4
      p-[4px] uppercase
      ${className}`}
      onClick={handleClickWrapper}>
      {titleTooltip ? <TitleWithTooltip /> : <Title />}

      <div className="flex content-between items-start py-[10px]" ref={inputRef}>
        <InputBigNumber
          value={baseToAsset(amount).amount()}
          onChange={onChangeHandler}
          onBlur={onBlurHandler}
          onFocus={onFocusHandler}
          size="xlarge"
          ghost
          error={showError}
          disabled={asLabel || disabled}
          decimal={amount.decimal}
          // override text style of input for acting as label only
          className={asLabel ? 'text-text0 !opacity-100 dark:text-text0d' : ''}
        />
      </div>
    </div>
  )
}
