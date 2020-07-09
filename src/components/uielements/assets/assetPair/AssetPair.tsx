import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import AssetIcon from '../assetIcon'
import { Size as CoinSize } from '../assetIcon/types'
import * as Styled from './AssetPair.style'

type Props = {
  from: Asset
  to: Asset
  size?: CoinSize
}

const AssetPair: React.FC<Props> = (props): JSX.Element => {
  const { from, to, size = 'big' } = props
  return (
    <Styled.AssetPairWrapper>
      <Styled.CoinWrapper>
        <AssetIcon asset={from} size={size} />
      </Styled.CoinWrapper>
      <Styled.PairIcon />
      <Styled.CoinWrapper>
        <AssetIcon asset={to} size={size} />
      </Styled.CoinWrapper>
    </Styled.AssetPairWrapper>
  )
}

export default AssetPair
