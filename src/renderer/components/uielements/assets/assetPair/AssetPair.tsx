import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { AssetIcon } from '../assetIcon'
import { Size as CoinSize } from '../assetIcon/AssetIcon.types'
import * as Styled from './AssetPair.style'

type Props = {
  from: Asset
  to: Asset
  size?: CoinSize
  network: Network
}

export const AssetPair: React.FC<Props> = (props): JSX.Element => {
  const { from, to, size = 'big', network } = props
  return (
    <Styled.AssetPairWrapper>
      <Styled.CoinWrapper>
        <AssetIcon asset={from} size={size} network={network} />
      </Styled.CoinWrapper>
      <Styled.PairIcon />
      <Styled.CoinWrapper>
        <AssetIcon asset={to} size={size} network={network} />
      </Styled.CoinWrapper>
    </Styled.AssetPairWrapper>
  )
}
