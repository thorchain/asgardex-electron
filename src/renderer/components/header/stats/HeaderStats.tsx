import React from 'react'

import { AssetAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { AssetWithAmount } from '../../../types/asgardex'
import * as Styled from './HeaderStats.style'

export type Props = {
  runePrice: AssetAmount /* in USD */
  volume24: AssetWithAmount
}

export const HeaderStats: React.FC<Props> = (props): JSX.Element => {
  const { runePrice, volume24 } = props

  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.SubLabel>Rune</Styled.SubLabel>
        <Styled.Label>{formatAssetAmountCurrency({ amount: runePrice, decimal: 2 })}</Styled.Label>
      </Styled.Container>
      <Styled.Container>
        <Styled.SubLabel>Vol. (24hrs)</Styled.SubLabel>
        <Styled.Label>
          {formatAssetAmountCurrency({ amount: baseToAsset(volume24.amount), asset: volume24.asset, decimal: 0 })}
        </Styled.Label>
      </Styled.Container>
    </Styled.Wrapper>
  )
}
