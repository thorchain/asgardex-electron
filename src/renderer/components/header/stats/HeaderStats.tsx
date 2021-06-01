import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseToAsset, formatAssetAmountCurrency, currencySymbolByAsset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { isUSDAsset } from '../../../helpers/assetHelper'
import { abbreviateNumber } from '../../../helpers/numberHelper'
import { loadingString } from '../../../helpers/stringHelper'
import { PriceRD } from '../../../services/midgard/types'
import * as Styled from './HeaderStats.style'

export type Props = {
  runePrice: PriceRD
  volume24Price: PriceRD
}

export const HeaderStats: React.FC<Props> = (props): JSX.Element => {
  const { runePrice: runePriceRD, volume24Price: volume24PriceRD } = props

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
  const prevVolume24PriceLabel = useRef<string>(loadingString)

  const volume24PriceLabel = useMemo(
    () =>
      FP.pipe(
        volume24PriceRD,
        RD.map(
          ({ asset, amount }) =>
            `${currencySymbolByAsset(asset)} ${abbreviateNumber(
              baseToAsset(amount) /* show values as `AssetAmount`   */
                .amount()
                .toNumber(),
              2
            )}`
        ),
        RD.map((label) => {
          // store price label
          prevVolume24PriceLabel.current = label
          return label
        }),
        RD.fold(
          () => prevVolume24PriceLabel.current,
          () => prevVolume24PriceLabel.current,
          () => '--',
          FP.identity
        )
      ),

    [volume24PriceRD]
  )

  return (
    <Styled.Wrapper>
      <Styled.Container>
        <Styled.Title>{intl.formatMessage({ id: 'common.price.rune' })}</Styled.Title>
        <Styled.Label loading={RD.isPending(runePriceRD)}>{runePriceLabel}</Styled.Label>
      </Styled.Container>
      <Styled.Container>
        <Styled.Title>{intl.formatMessage({ id: 'common.volume24' })}</Styled.Title>
        <Styled.Label loading={RD.isPending(volume24PriceRD)}>{volume24PriceLabel}</Styled.Label>
      </Styled.Container>
    </Styled.Wrapper>
  )
}
