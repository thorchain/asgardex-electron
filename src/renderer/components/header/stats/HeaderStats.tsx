import React, { useMemo, useRef } from 'react'

import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { isUSDAsset } from '../../../helpers/assetHelper'
import { loadingString } from '../../../helpers/stringHelper'
import { AssetWithAmount } from '../../../types/asgardex'
import * as Styled from './HeaderStats.style'

export type Props = {
  runePrice: O.Option<AssetWithAmount>
  volume24: AssetWithAmount
}

export const HeaderStats: React.FC<Props> = (props): JSX.Element => {
  const { runePrice: oRunePrice } = props

  const intl = useIntl()
  const prevRunePriceLabel = useRef<O.Option<string>>(O.none)

  const runePriceLabel = useMemo(
    () =>
      FP.pipe(
        oRunePrice,
        O.map(({ asset, amount }) =>
          formatAssetAmountCurrency({
            amount: baseToAsset(amount),
            asset,
            trimZeros: true,
            decimal: isUSDAsset(asset) ? 2 : 6
          })
        ),
        O.map((label) => {
          // store price label
          prevRunePriceLabel.current = O.some(label)
          return label
        }),
        O.alt(() => prevRunePriceLabel.current),
        O.getOrElse(() => loadingString)
      ),
    [oRunePrice]
  )

  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.Title>{intl.formatMessage({ id: 'common.price.rune' })}</Styled.Title>
        <Styled.Label>{runePriceLabel}</Styled.Label>
      </Styled.Container>
      {/* <Styled.Container>
        <Styled.Title>{intl.formatMessage({ id: 'common.volume24' })}</Styled.Title>
        <Styled.Label>
          {formatAssetAmountCurrency({ amount: baseToAsset(volume24.amount), asset: volume24.asset, decimal: 0 })}
        </Styled.Label>
      </Styled.Container> */}
    </Styled.Wrapper>
  )
}
