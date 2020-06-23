import React from 'react'

import { formatBN, formatBNCurrency } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import CoinIcon from '../coins/coinIcon'
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
  target?: string
  ticker: string
  marketPrice: BigNumber
  totalSupply: BigNumber
}

const TokenDetailCard: React.FC<Props> = ({
  title = 'TOKEN DETAILS',
  target = 'RUNE',
  ticker = '',
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
          <CoinIcon type={target} />
        </NewTokenCoin>

        <TokenName size="normal">{target.toUpperCase()}</TokenName>
        <Status title="Ticker" value={ticker.toUpperCase()} direction="horizontal" />
        <Status title="Market Price" value={`${formatBNCurrency(marketPrice)}`} direction="horizontal" />
        <Status title="Total Supply" value={formatBN(totalSupply)} direction="horizontal" />
      </NewTokenDetailWrapper>
    </TokenDetailContainer>
  )
}

export default TokenDetailCard
