import React from 'react'

import { BaseAmount, baseToAsset, formatAssetAmount } from '@thorchain/asgardex-util'
import { Col } from 'antd'

import Label from '../label'
import * as Styled from './Poolcard.style'

type PoolCardProps = {
  title: string
  source: string
  target: string
  runeAmount: BaseAmount
  runePrice: BaseAmount
  assetAmount: BaseAmount
  assetPrice: BaseAmount
  basePriceAsset: string
  loading?: boolean
  gradient?: number
  className?: string
}

export const PoolCard: React.FC<PoolCardProps> = ({
  title,
  loading,
  source,
  target,
  runeAmount,
  runePrice,
  assetAmount,
  assetPrice,
  basePriceAsset,
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
              <Styled.AssetName loading={loading}>{source}</Styled.AssetName>
            </Col>
            <Col>
              <Styled.AssetName loading={loading}>{target}</Styled.AssetName>
            </Col>
          </Styled.PoolCardRow>
        </Styled.DetailsWrapper>
        <Styled.PoolCardRow justify="space-around">
          <Styled.ValuesWrapper>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount(baseToAsset(runeAmount))}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceAsset} ${formatAssetAmount(baseToAsset(runePrice))}`}
            </Label>
          </Styled.ValuesWrapper>
          <Styled.ValuesWrapper>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount(baseToAsset(assetAmount))}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceAsset} ${formatAssetAmount(baseToAsset(assetPrice))}`}
            </Label>
          </Styled.ValuesWrapper>
        </Styled.PoolCardRow>
        {children && <Styled.PoolCardRow>{children}</Styled.PoolCardRow>}
      </Styled.PoolCardContent>
    </Styled.PoolCardContainer>
  )
}
