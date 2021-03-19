import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import * as Styled from './AssetLabel.style'

/**
 * AssetLabel - Component to show data of an asset:
 *
 * |--------|
 * | ticker |
 * | chain  |
 * |--------|
 *
 */

export type Props = {
  asset: Asset
  // `className` is needed by `styled components`
  className?: string
}

export const AssetLabel: React.FC<Props> = (props): JSX.Element => {
  const { asset, className } = props

  return (
    <Styled.Wrapper className={className}>
      <Styled.Col>
        <Styled.TickerLabel>{asset.ticker}</Styled.TickerLabel>
        <Styled.ChainLabel>{asset.chain}</Styled.ChainLabel>
      </Styled.Col>
    </Styled.Wrapper>
  )
}
