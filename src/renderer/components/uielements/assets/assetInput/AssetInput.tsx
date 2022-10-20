import React, { useRef, useCallback, useState } from 'react'

import { Asset, assetAmount, assetToBase, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { FixmeType } from '../../../../types/asgardex'
import { TooltipAddress } from '../../common/Common.styles'
import { InputBigNumber } from '../../input'
import { AssetSelect } from '../assetSelect'

export type Props = {
  title: string
  titleTooltip?: string
  amount: BaseAmount
  asset: Asset
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
    amount,
    asset,
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
    text-gray2 dark:text-gray2d m-0 bg-bg0 dark:bg-bg0d
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
      flex
      ${
        showError
          ? 'border-error0 dark:border-error0d'
          : focused
          ? 'border-turquoise'
          : 'border-gray1 dark:border-gray1d'
      }
      ease
      border
      uppercase
      ${className}`}
      ref={inputWrapperRef}
      onClick={handleClickWrapper}>
      {/* title */}
      {titleTooltip ? <TitleWithTooltip /> : <Title />}

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
        !my-20px
        w-full
        border-r
        border-gray1 dark:border-gray1d
          ${asLabel ? 'text-text0 !opacity-100 dark:text-text0d' : ''}`}
      />

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
