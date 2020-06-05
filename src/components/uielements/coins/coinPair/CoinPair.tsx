import React from 'react'

import { CaretRightOutlined } from '@ant-design/icons'

import CoinIcon from '../coinIcon'
import { CoinPairWrapper } from './CoinPair.style'

type Props = {
  className?: string
  from: string
  to: string
}

const CoinPair: React.FC<Props> = ({ className = '', from, to }): JSX.Element => {
  return (
    <CoinPairWrapper className={`coinPair-wrapper ${className}`}>
      <div className="coin-data">
        <CoinIcon type={from} />
      </div>
      <CaretRightOutlined className="arrow-icon" />
      <div className="coin-data">
        <CoinIcon type={to} />
      </div>
    </CoinPairWrapper>
  )
}

export default CoinPair
