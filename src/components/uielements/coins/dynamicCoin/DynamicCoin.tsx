import React from 'react'

import { rainbowStop, getIntFromName } from '../../../../helpers/colorHelpers'
import { DynamicCoinWrapper } from './DynamicCoin.style'
import { Size } from './types'

type Props = {
  type?: string
  className?: string
  size?: Size
}

const DynamicCoin: React.FC<Props> = ({ type = 'bnb', size = 'big', className = '' }: Props): JSX.Element => {
  const numbers: string[] = getIntFromName(type)
  const startCol = rainbowStop(numbers[0])
  const stopCol = rainbowStop(numbers[1])
  const coinName = type.length > 4 ? type.substr(0, 4) : type

  return (
    <DynamicCoinWrapper
      className={`dynamicCoin-wrapper coinData-coin-avatar ${className}`}
      startCol={startCol}
      stopCol={stopCol}
      size={size}>
      <span>{coinName}</span>
    </DynamicCoinWrapper>
  )
}

export default DynamicCoin
