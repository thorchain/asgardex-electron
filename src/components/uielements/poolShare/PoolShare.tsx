import React from 'react'

import { formatBN, AssetAmount, formatAssetAmount } from '@thorchain/asgardex-util'
import { Row, Col } from 'antd'
import BigNumber from 'bignumber.js'

import Label from '../label'
import { PoolShareWrapper, BorderWrapper, BorderShareWrapper, DetailsWrapper, ValuesWrapper } from './PoolShare.style'

type Props = {
  source: string
  target: string
  runeStakedShare: AssetAmount
  runeStakedPrice: AssetAmount
  loading?: boolean
  basePriceAsset: string
  assetStakedShare: AssetAmount
  assetStakedPrice: AssetAmount
  assetEarnedAmount: AssetAmount
  assetEarnedPrice: AssetAmount
  runeEarnedAmount: AssetAmount
  runeEarnedPrice: AssetAmount
  poolShare: BigNumber
}

const PoolShare: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    source,
    runeStakedShare,
    runeStakedPrice,
    loading,
    basePriceAsset,
    target,
    assetStakedShare,
    assetStakedPrice,
    assetEarnedAmount,
    assetEarnedPrice,
    runeEarnedAmount,
    runeEarnedPrice,
    poolShare
  } = props

  return (
    <PoolShareWrapper>
      <Label align="center">YOUR TOTAL SHARE OF THE POOL</Label>
      <BorderWrapper>
        <DetailsWrapper accent="primary">
          <Col span={6}>
            <Label align="center" loading={loading}>
              {source.toUpperCase()}
            </Label>
          </Col>
          <Col span={6}>
            <Label align="center" loading={loading}>
              {target.toUpperCase()}
            </Label>
          </Col>
        </DetailsWrapper>
        <Row justify="space-around">
          <ValuesWrapper span={6}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount(runeStakedShare)}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceAsset} ${formatAssetAmount(runeStakedPrice)}`}
            </Label>
          </ValuesWrapper>
          <ValuesWrapper span={6}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount(assetStakedShare)}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceAsset} ${formatAssetAmount(assetStakedPrice)}`}
            </Label>
          </ValuesWrapper>
        </Row>
      </BorderWrapper>
      <BorderShareWrapper>
        <Label align="center" loading={loading}>
          POOL SHARE
        </Label>
        <Label align="center" size="normal" color="dark" loading={loading}>
          {poolShare ? `${formatBN(poolShare)}%` : '...'}
        </Label>
      </BorderShareWrapper>
      <Label align="center" color="dark">
        YOUR TOTAL EARNINGS FROM THE POOL
      </Label>
      <BorderWrapper>
        <DetailsWrapper accent="secondary">
          <Col span={6}>
            <Label align="center" loading={loading}>
              {source.toUpperCase()}
            </Label>
          </Col>
          <Col span={6}>
            <Label align="center" loading={loading}>
              {target.toUpperCase()}
            </Label>
          </Col>
        </DetailsWrapper>
        <Row justify="space-around">
          <ValuesWrapper span={6}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount(runeEarnedAmount)}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceAsset} ${formatAssetAmount(runeEarnedPrice)}`}
            </Label>
          </ValuesWrapper>
          <ValuesWrapper span={6}>
            <Label align="center" loading={loading} color="dark">
              {formatAssetAmount(assetEarnedAmount)}
            </Label>
            <Label align="center" size="normal" color="light" loading={loading}>
              {`${basePriceAsset} ${formatAssetAmount(assetEarnedPrice)}`}
            </Label>
          </ValuesWrapper>
        </Row>
      </BorderWrapper>
    </PoolShareWrapper>
  )
}

export default PoolShare
