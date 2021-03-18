import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import * as Styled from './AssetLabel.style'

/**
 * AssetData - Component to show data of an asset:
 *
 * |------|-------------------|-------------------|------------------|
 * | icon | ticker (optional) | amount (optional) | price (optional) |
 * |------|-------------------|-------------------|------------------|
 *
 */

export type Props = {
  asset: Asset
  size?: Styled.AssetLabelSize
  // `className` is needed by `styled components`
  className?: string
}

export const AssetLabel: React.FC<Props> = (props): JSX.Element => {
  const { asset, size = 'small', className } = props

  return (
    <Styled.Wrapper className={className}>
      <Styled.Col>
        <Styled.TickerLabel className="ticker" size={size}>
          {asset.ticker}
        </Styled.TickerLabel>
        <Styled.TickerLabel className="small" size={size}>
          {asset.chain}
        </Styled.TickerLabel>
      </Styled.Col>
    </Styled.Wrapper>
  )
}
