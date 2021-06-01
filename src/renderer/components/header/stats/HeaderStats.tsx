import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { isUSDAsset } from '../../../helpers/assetHelper'
import { loadingString } from '../../../helpers/stringHelper'
import { RunePriceRD } from '../../../hooks/useRunePrice.types'
import { AssetWithAmount } from '../../../types/asgardex'
import * as Styled from './HeaderStats.style'

export type Props = {
  runePrice: RunePriceRD
  volume24: AssetWithAmount
}

export const HeaderStats: React.FC<Props> = (props): JSX.Element => {
  const { runePrice: runePriceRD } = props

  const intl = useIntl()
  const prevRunePriceLabel = useRef<string>(loadingString)

  const runePriceLabel = useMemo(
    () =>
      FP.pipe(
        runePriceRD,
        RD.map(({ asset, amount }) =>
          formatAssetAmountCurrency({
            amount: baseToAsset(amount),
            asset,
            trimZeros: true,
            decimal: isUSDAsset(asset) ? 2 : 6
          })
        ),
        RD.map((label) => {
          // store price label
          prevRunePriceLabel.current = label
          return label
        }),
        RD.fold(
          () => prevRunePriceLabel.current,
          () => prevRunePriceLabel.current,
          () => '--',
          FP.identity
        )
      ),

    [runePriceRD]
  )

  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.Title>{intl.formatMessage({ id: 'common.price.rune' })}</Styled.Title>
        <Styled.Label loading={RD.isPending(runePriceRD)}>{runePriceLabel}</Styled.Label>
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
