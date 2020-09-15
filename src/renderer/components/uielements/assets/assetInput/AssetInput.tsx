import React, { useRef, useCallback } from 'react'

import BigNumber from 'bignumber.js'

import { FixmeType } from '../../../../types/asgardex'
import { InputBigNumber } from '../../input'
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
    const target = inputRef.current?.firstChild
    if (target) target.focus()
  }, [])

  return (
    <AssetInputWrapper className={`assetInput-wrapper ${className}`} onClick={handleClickWrapper} {...otherProps}>
      <div className="asset-input-header">
        <p className="asset-input-title">{title}</p>
        {status && <p className="asset-input-header-label">{status}</p>}
        <p className="asset-amount-label">{label}</p>
      </div>
      <div className="asset-input-content" ref={inputRef}>
        <InputBigNumber value={amount} onChange={onChangeHandler} {...inputProps} />
      </div>
    </AssetInputWrapper>
  )
}

export default AssetInput
