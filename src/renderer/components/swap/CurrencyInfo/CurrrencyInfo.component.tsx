import React from 'react'

import { Asset, formatBN, bn } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { sequenceTOption } from '../../../helpers/fpHelpers'
import * as Styled from './CurrencyInfo.styles'

type CurrencyInfo = {
  from?: O.Option<{ asset: Asset; priceRune: BigNumber }>
  to?: O.Option<{ asset: Asset; priceRune: BigNumber }>
  slip?: BigNumber
}

export const CurrencyInfo = ({ to = O.none, from = O.none, slip = bn(0) }: CurrencyInfo) => {
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
