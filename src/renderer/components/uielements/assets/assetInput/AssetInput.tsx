import React, { useRef, useCallback, useState } from 'react'

import {
  Asset,
  assetAmount,
  assetToBase,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { isUSDAsset } from '../../../../helpers/assetHelper'
import { AssetWithAmount, FixmeType } from '../../../../types/asgardex'
import { TooltipAddress } from '../../common/Common.styles'
import { InputBigNumber } from '../../input'
import { AssetSelect } from '../assetSelect'

export type Props = {
  title: string
  titleTooltip?: string
  amount: AssetWithAmount
  priceAmount: AssetWithAmount
  assets: Asset[]
  network: Network
  disabled?: boolean
  showError?: boolean
  onChangeAsset: (asset: Asset) => void
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
    amount: { amount, asset },
    priceAmount: { amount: priceAmount, asset: priceAsset },
    assets,
    network,
    disabled = false,
    showError = false,
    className = '',
    asLabel = false,
    onChangeAsset,
    onChange = FP.constVoid,
    onBlur = FP.constVoid,
    onFocus = FP.constVoid
  } = props

  const inputWrapperRef = useRef<FixmeType>()

  const [focused, setFocused] = useState(false)

  const onChangeHandler = useCallback(
    (value: BigNumber) => {
      onChange(assetToBase(assetAmount(value, amount.decimal)))
    },
    [amount.decimal, onChange]
  )

  const handleClickWrapper = useCallback(() => {
    inputWrapperRef.current?.firstChild?.focus()
  }, [])

  const titleClassName = `absolute left-[10px] top-[-15px] p-5px font-main text-[14px]
    ${showError ? 'text-error0 dark:text-error0d' : 'text-gray2 dark:text-gray2d'} m-0 bg-bg0 dark:bg-bg0d`

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
      flex
      border-gray1 dark:border-gray1d
      ${showError ? 'border-error0 dark:border-error0d' : ''}
      ${focused ? 'shadow-full dark:shadow-fulld' : ''}
      ease
      border
      uppercase
      ${className}`}
      ref={inputWrapperRef}
      onClick={handleClickWrapper}>
      {/* title */}
      {titleTooltip ? <TitleWithTooltip /> : <Title />}

      <div
        className="flex w-full flex-col
        py-20px
        ">
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
          className={`
        w-full
        border-r
        border-gray1
        leading-none
        dark:border-gray1d
          ${asLabel ? 'text-text0 !opacity-100 dark:text-text0d' : ''}`}
        />

        <p
          className="mb-0 border-r border-gray1 px-15px font-main text-[14px]
        leading-none
        text-gray1 dark:border-gray1d dark:text-gray1d
        ">
          {formatAssetAmountCurrency({
            amount: baseToAsset(priceAmount),
            asset: priceAsset,
            decimal: isUSDAsset(priceAsset) ? 2 : 6,
            trimZeros: true
          })}
        </p>
      </div>

      <AssetSelect
        className="w-[240px]"
        onSelect={onChangeAsset}
        asset={asset}
        assets={assets}
        network={network}
        disabled={disabled}
      />
    </div>
  )
}
