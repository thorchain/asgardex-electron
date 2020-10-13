import React from 'react'

import { Asset, BaseAmount, baseToAsset, formatAssetAmount } from '@thorchain/asgardex-util'
import { Col } from 'antd'

import { BTC_DECIMAL, isBtcAsset } from '../../../helpers/assetHelper'
import Label from '../label'
import * as Styled from './Poolcard.style'

type PoolCardProps = {
  title: string
  sourceAsset: Asset
  targetAsset: Asset
  runeAmount: BaseAmount
  runePrice: BaseAmount
  assetAmount: BaseAmount
  assetPrice: BaseAmount
  basePriceSymbol: string
  loading?: boolean
  gradient?: number
  className?: string
}

export const PoolCard: React.FC<PoolCardProps> = ({
  title,
  loading,
  sourceAsset,
  targetAsset,
  runeAmount,
  runePrice,
  assetAmount,
  assetPrice,
  basePriceSymbol,
  children,
  className,
  gradient = 0
}) => {
  return (
    <Styled.PoolCardContainer className={className}>
      <Styled.SectionHeader>{title}</Styled.SectionHeader>
      <Styled.PoolCardContent>
        <Styled.DetailsWrapper gradient={gradient} accent="primary">
          <Styled.PoolCardRow>
            <Col>
              <Styled.AssetName loading={loading}>{sourceAsset.ticker}</Styled.AssetName>
            </Col>
            <Col>
              <Styled.AssetName loading={loading}>{targetAsset.ticker}</Styled.AssetName>
            </Col>
          </Styled.PoolCardRow>
        </Styled.DetailsWrapper>
        <Styled.PoolCardRow justify="space-around">
          <Styled.ValuesWrapper loading={`${loading}`}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount({ amount: baseToAsset(runeAmount), decimal: 2 })}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceSymbol} ${formatAssetAmount({ amount: baseToAsset(runePrice), decimal: 2 })}`}
            </Label>
          </Styled.ValuesWrapper>
          <Styled.ValuesWrapper loading={`${loading}`}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount({ amount: baseToAsset(assetAmount), trimZeros: true })}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceSymbol} ${formatAssetAmount({
                amount: baseToAsset(assetPrice),
                // special case for BTC
                decimal: isBtcAsset(sourceAsset) ? BTC_DECIMAL : 2
              })}`}
            </Label>
          </Styled.ValuesWrapper>
        </Styled.PoolCardRow>
        {children && <Styled.PoolCardRow>{children}</Styled.PoolCardRow>}
      </Styled.PoolCardContent>
    </Styled.PoolCardContainer>
  )
}
