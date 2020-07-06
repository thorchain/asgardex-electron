import React from 'react'

import { CaretRightOutlined } from '@ant-design/icons'
import { Asset } from '@thorchain/asgardex-util'

import CoinIcon from '../coinIcon'
import { CoinPairWrapper } from './CoinPair.style'

type Props = {
  from: Asset
  to: Asset
}

const CoinPair: React.FC<Props> = ({ from, to }): JSX.Element => {
  return (
    <CoinPairWrapper>
      <div className="coin-data">
        <CoinIcon asset={from} />
      </div>
      <CaretRightOutlined className="arrow-icon" />
      <div className="coin-data">
        <CoinIcon asset={to} />
      </div>
    </CoinPairWrapper>
  )
}

export default CoinPair
