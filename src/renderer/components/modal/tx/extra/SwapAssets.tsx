import React from 'react'

import BigNumber from 'bignumber.js'

import * as Styled from './Common.styles'
import * as C from './Common.types'
import * as SwapStyled from './SwapAssets.styles'

export type Props = {
  source: C.AssetData
  target: C.AssetData
  slip: BigNumber
  stepDescription: string
}

export const SwapAssets: React.FC<Props> = (props): JSX.Element => {
  const { source, target, slip, stepDescription } = props
  return (
    <>
      <Styled.StepLabel>{stepDescription}</Styled.StepLabel>
      <Styled.DataWrapper>
        <Styled.StepBar size={50} />
        <Styled.AssetsContainer>
          <Styled.AssetData asset={source.asset} amount={source.amount} />
          <Styled.AssetData asset={target.asset} amount={target.amount} />
        </Styled.AssetsContainer>
      </Styled.DataWrapper>
      <SwapStyled.Trend amount={slip} />
    </>
  )
}
