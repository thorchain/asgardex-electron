import React from 'react'

import { Asset, formatBN, bn } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import * as Styled from './CurrencyInfo.styles'

type CurrencyInfo = {
  from?: { asset: Asset; priceRune: BigNumber }
  to?: { asset: Asset; priceRune: BigNumber }
  slip?: BigNumber
}

export const CurrencyInfo = ({ to, from, slip = bn(0) }: CurrencyInfo) => {
  if (!from || !to) {
    return null
  }
  return (
    <Styled.Container>
      <div>
        1 {from.asset.ticker} = {formatBN(from.priceRune.dividedBy(to.priceRune), 5)} {to.asset.ticker}
      </div>
      <div>slip: {slip.multipliedBy(100).toFormat(2)}%</div>
    </Styled.Container>
  )
}
