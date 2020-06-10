import React, { useMemo } from 'react'

import { Nothing, Maybe } from '../../../../types/asgardex.d'
import CoinIcon from '../coinIcon'
import DynamicCoin from '../dynamicCoin'
import { CoinWrapper, CoinsWrapper } from './Coin.style'
import { CoinSize, coinGroup } from './types'

type Props = {
  type: Maybe<string>
  over?: Maybe<string>
  size?: CoinSize
  className?: string
}

const Coin: React.FC<Props> = (props: Props): JSX.Element => {
  const { type, size = 'big', over = Nothing, className = '', ...otherProps } = props

  const isDynamicIcon = useMemo(() => !coinGroup.includes(type.toLowerCase()), [type])

  if (over) {
    const isDynamicIconOver = !coinGroup.includes(over.toLowerCase())

    return (
      <CoinsWrapper size={size} className={`coin-wrapper ${className}`} {...otherProps}>
        {isDynamicIcon && <DynamicCoin className="dynamic-bottom" type={type} size={size} />}
        {!isDynamicIcon && (
          <div className="coin-bottom">
            <CoinIcon type={type} size={size} />
          </div>
        )}
        {isDynamicIconOver && <DynamicCoin className="dynamic-over" type={over} size={size} />}
        {!isDynamicIconOver && (
          <div className="coin-over">
            <CoinIcon type={over} size={size} />
          </div>
        )}
      </CoinsWrapper>
    )
  }
  if (isDynamicIcon) {
    return <DynamicCoin type={type} size={size} />
  }
  return (
    <CoinWrapper size={size} className={`coin-wrapper ${className}`} {...otherProps}>
      <CoinIcon type={type} size={size} />
    </CoinWrapper>
  )
}

export default Coin
