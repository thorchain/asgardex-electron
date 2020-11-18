import React from 'react'

import { formatBN, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { sequenceTOption } from '../../helpers/fpHelpers'
import { AssetWithPrice } from '../../services/binance/types'
import * as Styled from './CurrencyInfo.styles'

type CurrencyInfoProps = {
  from?: O.Option<AssetWithPrice>
  to?: O.Option<AssetWithPrice>
  slip?: BigNumber
}

// For some reason eslint does not see that CurrencyInfo is used by Swap.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CurrencyInfo = ({ to = O.none, from = O.none, slip = bn(0) }: CurrencyInfoProps) => {
  return pipe(
    sequenceTOption(from, to),
    O.map(([from, to]) => (
      <Styled.Container key={'currency info'}>
        <div>
          1 {from.asset.ticker} = {formatBN(from.priceRune.dividedBy(to.priceRune), 5)} {to.asset.ticker}
        </div>
        <div>slip: {slip.multipliedBy(100).toFormat(2)}%</div>
      </Styled.Container>
    )),
    O.toNullable
  )
}
