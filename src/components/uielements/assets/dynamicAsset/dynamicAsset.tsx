import React from 'react'

import { Size } from './types'
import { DynamicCoinWrapper } from './dynamicAsset.style'
import { rainbowStop, getIntFromName } from '../../../../helpers/colorHelpers'

export type Props = {
  type?: string
  size?: Size
  className?: string
}

const DynamicCoin: React.FC<Props> = (props: Props): JSX.Element => {
  const { type = 'bnb', size = 'big', className = '', ...otherProps } = props

  const numbers = getIntFromName(type)
  const startCol = rainbowStop(numbers[0])
  const stopCol = rainbowStop(numbers[1])

  const coinName = type.length > 4 ? type.substr(0, 4) : type

  return (
    <DynamicCoinWrapper
      type={type}
      size={size}
      className={`dynamicCoin-wrapper coinData-coin-avatar ${className}`}
      startCol={startCol}
      stopCol={stopCol}
      {...otherProps}>
      <span>{coinName}</span>
    </DynamicCoinWrapper>
  )
}

export default DynamicCoin
