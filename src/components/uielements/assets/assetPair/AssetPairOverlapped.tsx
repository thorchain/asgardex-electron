import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import CoinIcon from '../../coins/coinIcon'
import * as Styled from './AssetPair.style'
import { Size } from './types'

export type Props = {
  from: Asset
  to: Asset
  size?: Size
}

const AssetPairOverlapped: React.FC<Props> = (props: Props): JSX.Element => {
  const { from, to, size = 'big' } = props

  return (
    <Styled.AssetPairWrapper>
      <Styled.CoinWrapper>
        <CoinIcon asset={from} size={size} />
      </Styled.CoinWrapper>
      <Styled.CoinWrapper>
        <CoinIcon asset={to} size={size} />
      </Styled.CoinWrapper>
    </Styled.AssetPairWrapper>
  )
}

export default AssetPairOverlapped
