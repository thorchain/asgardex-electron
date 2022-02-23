import React from 'react'

import { Network } from '../../../../../shared/api/types'
import * as Styled from './Common.styles'
import * as C from './Common.types'

export type Props = {
  asset: C.AssetData
  title: string
  network: Network
}

export const SendAsset: React.FC<Props> = (props): JSX.Element => {
  const { asset, title, network } = props
  return (
    <>
      <Styled.StepLabel>{title}</Styled.StepLabel>
      <Styled.DataWrapper>
        <Styled.AssetsContainer>
          <Styled.AssetData size="big" asset={asset.asset} amount={asset.amount} network={network} />
        </Styled.AssetsContainer>
      </Styled.DataWrapper>
    </>
  )
}
