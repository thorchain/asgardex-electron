import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import CoinIcon from '../coinIcon'
import * as Styled from './CoinPair.style'

type Props = {
  from: Asset
  to: Asset
}

const CoinPair: React.FC<Props> = ({ from, to }): JSX.Element => {
  return (
    <Styled.CoinPairWrapper>
      <Styled.CoinWrapper>
        <CoinIcon asset={from} />
      </Styled.CoinWrapper>
      <Styled.PairIcon />
      <Styled.CoinWrapper>
        <CoinIcon asset={to} />
      </Styled.CoinWrapper>
    </Styled.CoinPairWrapper>
  )
}

export default CoinPair
