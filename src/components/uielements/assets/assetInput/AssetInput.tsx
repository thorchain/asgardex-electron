import React, { useRef, useCallback } from 'react'

import BigNumber from 'bignumber.js'

import { FixmeType } from '../../../../types/asgardex'
import CoinInputAdvanced from '../../coins/coinInputAdvanced'
import { AssetInputWrapper } from './AssetInput.style'
import { AssetInputProps } from './types'

type Props = {
  title: string
  status?: string
  amount: BigNumber
  label: string
  inputProps?: AssetInputProps
  onChange: (value: BigNumber) => void
  className?: string
}

const AssetInput: React.FC<Props> = (props: Props): JSX.Element => {
  const { title, amount, status, label, inputProps = {}, className = '', onChange, ...otherProps } = props

  const inputRef = useRef<FixmeType>()

  const onChangeHandler = useCallback(
    (value: BigNumber) => {
      onChange(value)
    },
    [onChange]
  )

  const handleClickWrapper = useCallback(() => {
    inputRef.current?.firstChild?.focus()
  }, [])

  return (
    <AssetInputWrapper className={`assetInput-wrapper ${className}`} onClick={handleClickWrapper} {...otherProps}>
      <div className="asset-input-header">
        <p className="asset-input-title">{title}</p>
        {status && <p className="asset-input-header-label">{status}</p>}
      </div>
      <div className="asset-input-content" ref={inputRef}>
        <CoinInputAdvanced
          className="asset-amount-input"
          value={amount}
          onChangeValue={onChangeHandler}
          {...inputProps}
        />
        <p className="asset-amount-label">{label}</p>
      </div>
    </AssetInputWrapper>
  )
}

export default AssetInput
