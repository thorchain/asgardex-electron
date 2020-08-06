import React from 'react'

import { Asset, formatBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import * as Styled from './CurrencyInfo.styles'

type CurrencyInfo = {
  from?: { asset: Asset; priceRune: BigNumber }
  to?: { asset: Asset; priceRune: BigNumber }
}

export const CurrencyInfo = ({ from, to }: CurrencyInfo) => {
  if (!from || !to) {
    return null
  }
  return (
    <Styled.Container>
      <div>
        1 {from.asset.ticker} = {formatBN(from.priceRune.dividedBy(to.priceRune), 5)} {to.asset.ticker}
      </div>
      <div>slip: 1%</div>
    </Styled.Container>
  )
}
