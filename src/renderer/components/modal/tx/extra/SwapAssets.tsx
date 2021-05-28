import React from 'react'

import BigNumber from 'bignumber.js'

import { Network } from '../../../../../shared/api/types'
import * as Styled from './Common.styles'
import * as C from './Common.types'
import * as SwapStyled from './SwapAssets.styles'

export type Props = {
  source: C.AssetData
  target: C.AssetData
  slip?: BigNumber
  stepDescription: string
  network: Network
}

export const SwapAssets: React.FC<Props> = (props): JSX.Element => {
  const { source, target, stepDescription, network, slip } = props
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
      {slip && <SwapStyled.Trend amount={slip} />}
    </>
  )
}
