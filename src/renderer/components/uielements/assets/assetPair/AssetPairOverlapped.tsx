import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import AssetIcon from '../assetIcon'
import { Size as IconSize } from '../assetIcon/types'
import * as Styled from './AssetPairOverlapped.style'

type Props = {
  asset: Asset
  target: Asset
  size?: IconSize
  className?: string
}

const AssetPairOverlapped: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, target, size = 'normal' } = props

  return (
    <Styled.CoinsWrapper size={size}>
      <Styled.IconBottomWrapper size={size}>
        <AssetIcon asset={asset} size={size} />
      </Styled.IconBottomWrapper>
      <Styled.IconOverWrapper size={size}>
        <AssetIcon asset={target} size={size} />
      </Styled.IconOverWrapper>
    </Styled.CoinsWrapper>
  )
}

export default AssetPairOverlapped
