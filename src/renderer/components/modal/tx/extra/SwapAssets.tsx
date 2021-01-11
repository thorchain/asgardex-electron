import React from 'react'

import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import * as Styled from './SwapAssets.styles'

export type Props = {
  source: { asset: Asset; amount: BaseAmount }
  target: { asset: Asset; amount: BaseAmount }
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
      <Styled.Trend amount={slip} />
    </>
  )
}
