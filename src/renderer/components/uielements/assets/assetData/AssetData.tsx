import React from 'react'

import { BaseAmount, formatAssetAmountCurrency, baseToAsset, baseAmount, Asset } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { PricePoolAsset } from '../../../../views/pools/Pools.types'
import * as Styled from './AssetData.styles'

/**
 * AssetData - Component to show data of an asset:
 *
 * |------|-------------------|-------------------|------------------|
 * | icon | ticker (optional) | amount (optional) | price (optional) |
 * |------|-------------------|-------------------|------------------|
 *
 */

export type Props = {
  asset: Asset
  noTicker?: boolean
  amount?: BaseAmount
  price?: BaseAmount
  priceAsset?: PricePoolAsset
  size?: Styled.AssetDataSize
  // `className` is needed by `styled components`
  className?: string
  network: Network
  noIcon?: boolean
}

export const AssetData: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    amount: assetAmount,
    noTicker = false,
    price = baseAmount(0),
    priceAsset,
    size = 'small',
    className,
    network,
    noIcon
  } = props

  const priceLabel = priceAsset
    ? formatAssetAmountCurrency({ amount: baseToAsset(price), asset: priceAsset, trimZeros: true })
    : ''

  return (
    <Styled.Wrapper className={className}>
      {!noIcon && (
        <Styled.Col>
          <Styled.AssetIcon asset={asset} size={size} network={network} />
        </Styled.Col>
      )}
      {!noTicker && (
        <Styled.Col>
          <Styled.TickerLabel>{asset.ticker}</Styled.TickerLabel>
          <Styled.ChainLabel>{asset.chain}</Styled.ChainLabel>
        </Styled.Col>
      )}
      {assetAmount && (
        <Styled.Col>
          <Styled.AmountLabel size={size}>
            {formatAssetAmountCurrency({ amount: baseToAsset(assetAmount), asset, trimZeros: true })}
          </Styled.AmountLabel>
        </Styled.Col>
      )}

      {!!priceLabel && (
        <Styled.Col>
          <Styled.PriceLabel size={size}>{priceLabel}</Styled.PriceLabel>
        </Styled.Col>
      )}
    </Styled.Wrapper>
  )
}
