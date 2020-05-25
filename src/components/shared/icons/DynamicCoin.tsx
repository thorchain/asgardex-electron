import React from 'react'

import { rainbowStop, getIntFromName } from '../../../helpers/colorHelpers'
import { shortSymbol } from '../../../helpers/tokenHelpers'
import { DynamicCoinWrapper } from './DynamicCoin.style'

type Props = { type: string; size: string }
const DynamicCoin: React.FC<Props> = (props): JSX.Element => {
  const symbol = shortSymbol(props.type)
  const gradientColors = () => {
    const numbers = getIntFromName(symbol)
    const start = rainbowStop(numbers[0])
    const stop = rainbowStop(numbers[1])
    return 'linear-gradient(45deg,' + start + ', ' + stop + ')'
  }
  const backgroundStyle = {
    backgroundImage: gradientColors()
  }
  return (
    <DynamicCoinWrapper style={backgroundStyle} {...props}>
      {symbol}
    </DynamicCoinWrapper>
  )
}
export default DynamicCoin
