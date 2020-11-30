import React, { RefObject, useCallback, useMemo, useRef } from 'react'

import {
  formatBN,
  BaseAmount,
  Asset,
  formatBaseAsAssetAmount,
  formatAssetAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  baseAmount
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { useElementWidth } from '../../../hooks/useContainerWidth'
import * as Styled from './PoolShare.style'
import { PoolShareCard } from './PoolShareCard'

type Props = {
  sourceAsset: Asset
  targetAsset: Asset
  runeStakedShare: BaseAmount
  runeStakedPrice: BaseAmount
  loading?: boolean
  priceAsset?: Asset
  assetStakedShare: BaseAmount
  assetStakedPrice: BaseAmount
  poolShare: BigNumber
  stakeUnits: BaseAmount
}

export const PoolShare: React.FC<Props> = (props): JSX.Element => {
  const {
    sourceAsset,
    runeStakedShare,
    runeStakedPrice,
    loading,
    priceAsset,
    targetAsset,
    assetStakedShare,
    assetStakedPrice,
    poolShare,
    stakeUnits
  } = props

  const intl = useIntl()

  const totalStakedPrice = useMemo(() => baseAmount(runeStakedPrice.amount().plus(assetStakedPrice.amount())), [
    assetStakedPrice,
    runeStakedPrice
  ])

  const ref: RefObject<HTMLDivElement> = useRef(null)

  const wrapperWidth = useElementWidth(ref)

  const smallWidth = wrapperWidth <= 576 // sm

  const renderRedemptionCol = useCallback(
    (amount: BaseAmount, price: BaseAmount) => (
      <Col span={smallWidth ? 24 : 12}>
        <Styled.LabelPrimary loading={loading}>
          {formatAssetAmount({ amount: baseToAsset(amount), decimal: 2 })}
        </Styled.LabelPrimary>
        <Styled.LabelSecondary loading={loading}>
          {formatAssetAmountCurrency({ amount: baseToAsset(price), asset: priceAsset, decimal: 2 })}
        </Styled.LabelSecondary>
      </Col>
    ),
    [loading, priceAsset, smallWidth]
  )

  const renderRedemptionLarge = useMemo(
    () => (
      <>
        <Styled.RedemptionHeader>
          <Styled.CardRow>
            <Col span={12}>
              <Styled.RedemptionAsset>{sourceAsset.ticker}</Styled.RedemptionAsset>
            </Col>
            <Col span={12}>
              <Styled.RedemptionAsset>{targetAsset.ticker}</Styled.RedemptionAsset>
            </Col>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>
          {renderRedemptionCol(runeStakedShare, runeStakedPrice)}
          {renderRedemptionCol(assetStakedShare, assetStakedPrice)}
        </Styled.CardRow>
      </>
    ),
    [
      assetStakedPrice,
      assetStakedShare,
      renderRedemptionCol,
      runeStakedPrice,
      runeStakedShare,
      sourceAsset.ticker,
      targetAsset.ticker
    ]
  )

  const renderRedemptionSmall = useMemo(
    () => (
      <>
        <Styled.RedemptionHeader>
          <Styled.CardRow>
            <Col span={24}>
              <Styled.RedemptionAsset>{sourceAsset.ticker}</Styled.RedemptionAsset>
            </Col>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>{renderRedemptionCol(runeStakedShare, runeStakedPrice)}</Styled.CardRow>
        <Styled.RedemptionHeader>
          <Styled.CardRow>
            <Col span={24}>
              <Styled.RedemptionAsset>{targetAsset.ticker}</Styled.RedemptionAsset>
            </Col>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>{renderRedemptionCol(assetStakedShare, assetStakedPrice)}</Styled.CardRow>
      </>
    ),
    [
      assetStakedPrice,
      assetStakedShare,
      renderRedemptionCol,
      runeStakedPrice,
      runeStakedShare,
      sourceAsset.ticker,
      targetAsset.ticker
    ]
  )
  const renderRedemption = useMemo(() => (smallWidth ? renderRedemptionSmall : renderRedemptionLarge), [
    renderRedemptionLarge,
    renderRedemptionSmall,
    smallWidth
  ])

  return (
    <Styled.PoolShareWrapper ref={ref}>
      <PoolShareCard title={intl.formatMessage({ id: 'deposit.share.title' })}>
        <Styled.CardRow>
          <Col span={smallWidth ? 24 : 12} style={{ paddingBottom: smallWidth ? '20px' : '0' }}>
            <Styled.LabelSecondary textTransform="uppercase">
              {intl.formatMessage({ id: 'deposit.share.units' })}
            </Styled.LabelSecondary>
            <Styled.LabelPrimary loading={loading}>{`${formatBaseAsAssetAmount({
              amount: stakeUnits,
              decimal: 2
            })}`}</Styled.LabelPrimary>
          </Col>
          <Col span={smallWidth ? 24 : 12}>
            <Styled.LabelSecondary textTransform="uppercase">
              {intl.formatMessage({ id: 'deposit.share.poolshare' })}
            </Styled.LabelSecondary>
            <Styled.LabelPrimary loading={loading}>{`${formatBN(poolShare)}%`}</Styled.LabelPrimary>
          </Col>
        </Styled.CardRow>
      </PoolShareCard>
      <PoolShareCard title={intl.formatMessage({ id: 'deposit.redemption.title' })}>
        {renderRedemption}
        <Styled.CardRow>
          <Col span={24}>
            <Styled.LabelSecondary textTransform="uppercase">
              {intl.formatMessage({ id: 'deposit.share.total' })}
            </Styled.LabelSecondary>
            <Styled.LabelPrimary loading={loading}>
              {formatAssetAmountCurrency({ amount: baseToAsset(totalStakedPrice), asset: priceAsset, decimal: 2 })}
            </Styled.LabelPrimary>
          </Col>
        </Styled.CardRow>
      </PoolShareCard>
    </Styled.PoolShareWrapper>
  )
}
