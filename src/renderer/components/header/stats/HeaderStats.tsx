import React, { useCallback, useMemo, useRef } from 'react'

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
  reloadRunePrice: FP.Lazy<void>
  volume24Price: PriceRD
  reloadVolume24Price: FP.Lazy<void>
}

export const HeaderStats: React.FC<Props> = (props): JSX.Element => {
  const { runePrice: runePriceRD, reloadRunePrice, volume24Price: volume24PriceRD, reloadVolume24Price } = props

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
            (prevVolume24PriceLabel.current /* store price label */ = `${currencySymbolByAsset(
              asset
            )} ${abbreviateNumber(
              baseToAsset(amount) /* show values as `AssetAmount`   */
                .amount()
                .toNumber(),
              2
            )}`)
        ),
        RD.fold(
          () => prevVolume24PriceLabel.current,
          () => prevVolume24PriceLabel.current,
          () => '--',
          FP.identity
        )
      ),

    [volume24PriceRD]
  )

  const reloadVolume24PriceHandler = useCallback(() => {
    if (!RD.isPending(volume24PriceRD)) {
      reloadVolume24Price()
    }
  }, [reloadVolume24Price, volume24PriceRD])

  const reloadRunePriceHandler = useCallback(() => {
    if (!RD.isPending(runePriceRD)) {
      reloadRunePrice()
    }
  }, [reloadRunePrice, runePriceRD])

  return (
    <Styled.Wrapper>
      <Styled.Container onClick={reloadRunePriceHandler} clickable={!RD.isPending(runePriceRD)}>
        <Styled.Title>{intl.formatMessage({ id: 'common.price.rune' })}</Styled.Title>
        <Styled.Label loading={RD.isPending(runePriceRD) ? 'true' : 'false'}>{runePriceLabel}</Styled.Label>
      </Styled.Container>
      <Styled.Container onClick={reloadVolume24PriceHandler} clickable={!RD.isPending(volume24PriceRD)}>
        <Styled.Title>{intl.formatMessage({ id: 'common.volume24' })}</Styled.Title>
        <Styled.Label loading={RD.isPending(volume24PriceRD) ? 'true' : 'false'}>{volume24PriceLabel}</Styled.Label>
      </Styled.Container>
    </Styled.Wrapper>
  )
}
