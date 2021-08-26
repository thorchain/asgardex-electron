import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { AssetIcon } from '../assetIcon'
import { Size as IconSize } from '../assetIcon/AssetIcon.types'
import * as Styled from './AssetPairOverlapped.styles'

type Props = {
  asset: Asset
  target: Asset
  size?: IconSize
  className?: string
  network: Network
}

export const AssetPairOverlapped: React.FC<Props> = (props): JSX.Element => {
  const { asset, target, size = 'normal', network } = props

  return (
    <Styled.CoinsWrapper size={size}>
      <Styled.IconBottomWrapper size={size}>
        <AssetIcon asset={asset} size={size} network={network} />
      </Styled.IconBottomWrapper>
      <Styled.IconOverWrapper size={size}>
        <AssetIcon asset={target} size={size} network={network} />
      </Styled.IconOverWrapper>
    </Styled.CoinsWrapper>
  )
}
