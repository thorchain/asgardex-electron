import React from 'react'

import { Network } from '../../../../../shared/api/types'
import * as Styled from './Common.styles'
import * as C from './Common.types'

export type Props = {
  source: C.AssetData
  target: C.AssetData
  stepDescription: string
  network: Network
}

export const SwapAssets: React.FC<Props> = (props): JSX.Element => {
  const { source, target, stepDescription, network } = props
  return (
    <>
      <Styled.StepLabel>{stepDescription}</Styled.StepLabel>
      <Styled.DataWrapper>
        <Styled.StepBar size={50} />
        <Styled.AssetsContainer>
          <Styled.AssetData asset={source.asset} amount={source.amount} network={network} />
          <Styled.AssetData asset={target.asset} amount={target.amount} network={network} />
        </Styled.AssetsContainer>
      </Styled.DataWrapper>
    </>
  )
}
