import React from 'react'

import { formatBN, formatBNCurrency, Asset } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import AssetIcon from '../assets/assetIcon'
import Status from '../status'
import {
  TokenDetailContainer,
  TitleLabel,
  NewTokenDetailWrapper,
  NewTokenCoin,
  TokenName
} from './TokenDetailCard.style'

export type Props = {
  title: string
  target: Asset
  marketPrice: BigNumber
  totalSupply: BigNumber
}

const TokenDetailCard: React.FC<Props> = ({
  title = 'TOKEN DETAILS',
  target,
  marketPrice,
  totalSupply
}): JSX.Element => {
  return (
    <TokenDetailContainer>
      <TitleLabel size="normal" weight="bold">
        {title}
      </TitleLabel>

      <NewTokenDetailWrapper>
        <NewTokenCoin>
          <AssetIcon asset={target} />
        </NewTokenCoin>

        <TokenName size="normal">{target?.symbol ?? 'unknown'}</TokenName>
        <Status title="Ticker" value={target?.ticker ?? 'unknown'} direction="horizontal" />
        <Status title="Market Price" value={`${formatBNCurrency(marketPrice)}`} direction="horizontal" />
        <Status title="Total Supply" value={formatBN(totalSupply)} direction="horizontal" />
      </NewTokenDetailWrapper>
    </TokenDetailContainer>
  )
}

export default TokenDetailCard
