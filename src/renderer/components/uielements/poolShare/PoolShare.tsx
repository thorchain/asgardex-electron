import React, { RefObject, useCallback, useMemo, useRef } from 'react'

import {
  formatBN,
  BaseAmount,
  Asset,
  baseToAsset,
  formatAssetAmountCurrency,
  baseAmount,
  AssetRuneNative
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { AssetWithDecimal } from '../../../types/asgardex'
import * as Styled from './PoolShare.style'
import { PoolShareCard } from './PoolShareCard'

type Props = {
  asset: AssetWithDecimal
  runePrice: BaseAmount
  priceAsset?: Asset
  /**
   * Shares of Rune and selected Asset.
   * Note: Decimal needs to be based on **original asset decimals**
   **/
  shares: { rune: BaseAmount; asset: BaseAmount }
  assetPrice: BaseAmount
  poolShare: BigNumber
  depositUnits: BigNumber
  smallWidth?: boolean
  loading?: boolean
}

export const PoolShare: React.FC<Props> = (props): JSX.Element => {
  const {
    asset: assetWD,
    runePrice,
    loading,
    priceAsset,
    shares: { rune: runeShare, asset: assetShare },
    assetPrice,
    poolShare,
    depositUnits,
    smallWidth
  } = props

  const intl = useIntl()

  const { asset } = assetWD

  const totalDepositPrice = useMemo(() => baseAmount(runePrice.amount().plus(assetPrice.amount())), [
    assetPrice,
    runePrice
  ])

  const ref: RefObject<HTMLDivElement> = useRef(null)

  const renderRedemptionCol = useCallback(
    (amount: BaseAmount, price: BaseAmount, asset: Asset) => (
      <Col span={smallWidth ? 24 : 12}>
        <Styled.LabelPrimary loading={loading}>
          {formatAssetAmountCurrency({ amount: baseToAsset(amount), asset, decimal: 2 })}
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
              <Styled.RedemptionAsset asset={AssetRuneNative} />
            </Col>
            <Col span={12}>
              <Styled.RedemptionAsset asset={asset} />
            </Col>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>
          {renderRedemptionCol(runeShare, runePrice, AssetRuneNative)}
          {renderRedemptionCol(assetShare, assetPrice, asset)}
        </Styled.CardRow>
      </>
    ),
    [asset, renderRedemptionCol, runeShare, runePrice, assetShare, assetPrice]
  )

  const renderRedemptionSmall = useMemo(
    () => (
      <>
        <Styled.RedemptionHeader>
          <Styled.CardRow>
            <Col span={24}>
              <Styled.RedemptionAsset asset={AssetRuneNative} />
            </Col>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>{renderRedemptionCol(runeShare, runePrice, AssetRuneNative)}</Styled.CardRow>
        <Styled.RedemptionHeader>
          <Styled.CardRow>
            <Col span={24}>
              <Styled.RedemptionAsset asset={asset} />
            </Col>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>{renderRedemptionCol(assetShare, assetPrice, asset)}</Styled.CardRow>
      </>
    ),
    [renderRedemptionCol, runeShare, runePrice, asset, assetShare, assetPrice]
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
            <Styled.LabelPrimary loading={loading}>{`${formatBN(depositUnits, 0)}`}</Styled.LabelPrimary>
          </Col>
          <Col span={smallWidth ? 24 : 12}>
            <Styled.LabelSecondary textTransform="uppercase">
              {intl.formatMessage({ id: 'deposit.share.poolshare' })}
            </Styled.LabelSecondary>
            <Styled.LabelPrimary loading={loading}>{`${formatBN(poolShare, 2)}%`}</Styled.LabelPrimary>
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
              {formatAssetAmountCurrency({ amount: baseToAsset(totalDepositPrice), asset: priceAsset, decimal: 2 })}
            </Styled.LabelPrimary>
          </Col>
        </Styled.CardRow>
      </PoolShareCard>
    </Styled.PoolShareWrapper>
  )
}
