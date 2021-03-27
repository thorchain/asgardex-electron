import React from 'react'

import * as Styled from './PoolTitle.style'

export type Props = {
  isLoading?: boolean
}

export const PoolTitle: React.FC<Props> = ({ isLoading }) => {
  return (
    <Styled.Container>
      <Styled.RowItem>
        <Styled.Title>Binance Bitcoin (BNB.BTC)</Styled.Title>
        <Styled.Price>$20.00</Styled.Price>
      </Styled.RowItem>
      <Styled.RowItem>
        <Styled.Title loading={isLoading}>Liquidity</Styled.Title>
        <Styled.Title loading={isLoading}>Swap</Styled.Title>
      </Styled.RowItem>
    </Styled.Container>
  )
}
