import React from 'react'

import { bn, assetAmount, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'

import { ONE_ASSET_AMOUNT } from '../../const'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { AssetWithPrice } from '../../services/binance/types'
import * as Styled from './CurrencyInfo.styles'

type CurrencyInfoProps = {
  from?: O.Option<AssetWithPrice>
  to?: O.Option<AssetWithPrice>
  slip?: BigNumber
}

export const CurrencyInfo = ({ to = O.none, from = O.none, slip = bn(0) }: CurrencyInfoProps) => {
  return pipe(
    sequenceTOption(from, to),
    O.map(([from, to]) => {
      return (
        <Styled.Container key={'currency info'}>
          <div>
            {formatAssetAmountCurrency({
              asset: from.asset,
              amount: ONE_ASSET_AMOUNT,
              trimZeros: true
            })}{' '}
            ={' '}
            {formatAssetAmountCurrency({
              asset: to.asset,
              amount: assetAmount(from.priceRune.dividedBy(to.priceRune)),
              trimZeros: true
            })}
          </div>
          <div>
            {formatAssetAmountCurrency({
              asset: to.asset,
              amount: ONE_ASSET_AMOUNT,
              trimZeros: true
            })}{' '}
            ={' '}
            {formatAssetAmountCurrency({
              asset: from.asset,
              amount: assetAmount(to.priceRune.dividedBy(from.priceRune)),
              trimZeros: true
            })}
          </div>
          <div>slip: {slip.multipliedBy(100).toFormat(2)}%</div>
        </Styled.Container>
      )
    }),
    O.toNullable
  )
}
