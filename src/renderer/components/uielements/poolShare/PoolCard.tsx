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
  basePriceSymbol: string
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
              <Styled.AssetName loading={loading}>{source}</Styled.AssetName>
            </Col>
            <Col>
              <Styled.AssetName loading={loading}>{target}</Styled.AssetName>
            </Col>
          </Styled.PoolCardRow>
        </Styled.DetailsWrapper>
        <Styled.PoolCardRow justify="space-around">
          <Styled.ValuesWrapper loading={`${loading}`}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount({ amount: baseToAsset(runeAmount), trimZeros: true })}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceSymbol} ${formatAssetAmount({ amount: baseToAsset(runePrice), trimZeros: true })}`}
            </Label>
          </Styled.ValuesWrapper>
          <Styled.ValuesWrapper loading={`${loading}`}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount({ amount: baseToAsset(assetAmount), trimZeros: true })}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceSymbol} ${formatAssetAmount({ amount: baseToAsset(assetPrice), trimZeros: true })}`}
            </Label>
          </Styled.ValuesWrapper>
        </Styled.PoolCardRow>
        {children && <Styled.PoolCardRow>{children}</Styled.PoolCardRow>}
      </Styled.PoolCardContent>
    </Styled.PoolCardContainer>
  )
}
