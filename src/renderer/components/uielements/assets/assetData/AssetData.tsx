import React from 'react'

import { BaseAmount, formatAssetAmountCurrency, baseToAsset, baseAmount, Asset } from '@xchainjs/xchain-util'
import { Col } from 'antd'

import { PricePoolAsset } from '../../../../views/pools/Pools.types'
import * as Styled from './AssetData.style'

/**
 * AssetData - Component to show data of an asset:
 *
 * |------|-------------------|-------------------|------------------|
 * | icon | ticker (optional) | amount (optional) | price (optional) |
 * |------|-------------------|-------------------|------------------|
 *
 */

type Props = {
  asset: Asset
  noTicker?: boolean
  amount?: BaseAmount
  price?: BaseAmount
  priceAsset?: PricePoolAsset
  size?: Styled.AssetDataSize
}

export const AssetData: React.FC<Props> = (props): JSX.Element => {
  const { asset, amount: assetAmount, noTicker = false, price = baseAmount(0), priceAsset, size = 'small' } = props

  const priceLabel = priceAsset
    ? formatAssetAmountCurrency({ amount: baseToAsset(price), asset: priceAsset, trimZeros: true })
    : ''

  return (
    <Styled.Wrapper>
      <Col>
        <Styled.AssetIcon asset={asset} size={size} />
      </Col>
      {!noTicker && (
        <Col>
          <Styled.TickerLabel size={size}>{asset.ticker}</Styled.TickerLabel>
        </Col>
      )}
      {assetAmount && (
        <Col>
          <Styled.AmountLabel size={size}>
            {formatAssetAmountCurrency({ amount: baseToAsset(assetAmount), asset, trimZeros: true })}
          </Styled.AmountLabel>
        </Col>
      )}

      {!!priceLabel && (
        <Col>
          <Styled.PriceLabel size={size}>{priceLabel}</Styled.PriceLabel>
        </Col>
      )}
    </Styled.Wrapper>
  )
}
