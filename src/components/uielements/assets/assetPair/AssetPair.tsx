import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import CoinIcon from '../../coins/coinIcon'
import * as Styled from './AssetPair.style'
import { Size } from './types'

type Props = {
  from: Asset
  to: Asset
  size?: Size
}

const AssetPair: React.FC<Props> = (props): JSX.Element => {
  const { from, to, size = 'big' } = props
  return (
    <Styled.AssetPairWrapper>
      <Styled.CoinWrapper>
        <CoinIcon asset={from} size={size} />
      </Styled.CoinWrapper>
      <Styled.PairIcon />
      <Styled.CoinWrapper>
        <CoinIcon asset={to} size={size} />
      </Styled.CoinWrapper>
    </Styled.AssetPairWrapper>
  )
}

export default AssetPair
