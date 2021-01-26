import React, { useRef, useCallback } from 'react'

import { assetAmount, assetToBase, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { FixmeType } from '../../../../types/asgardex'
import { InputBigNumber } from '../../input'
import { AssetInputWrapper } from './AssetInput.style'
import { AssetInputProps } from './AssetInput.types'

type Props = {
  title: string
  status?: string
  amount: BaseAmount
  label: string
  inputProps?: AssetInputProps
  onChange: (value: BaseAmount) => void
  className?: string
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
  const { title, amount, status, label, inputProps = {}, className = '', onChange, ...otherProps } = props

  const inputRef = useRef<FixmeType>()

  const onChangeHandler = useCallback(
    (value: BigNumber) => {
      onChange(assetToBase(assetAmount(value, amount.decimal)))
    },
    [amount.decimal, onChange]
  )

  const handleClickWrapper = useCallback(() => {
    inputRef.current?.firstChild?.focus()
  }, [])

  return (
    <AssetInputWrapper className={`assetInput-wrapper ${className}`} onClick={handleClickWrapper} {...otherProps}>
      <div className="asset-input-header">
        <p className="asset-input-title">{title}</p>
        {status && <p className="asset-input-header-label">{status}</p>}
        <p className="asset-amount-label">{label}</p>
      </div>
      <div className="asset-input-content" ref={inputRef}>
        <InputBigNumber
          value={baseToAsset(amount).amount()}
          onChange={onChangeHandler}
          size={'large'}
          {...inputProps}
          decimal={amount.decimal}
        />
      </div>
    </AssetInputWrapper>
  )
}
