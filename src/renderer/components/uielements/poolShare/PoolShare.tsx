import React, { RefObject, useCallback, useMemo, useRef } from 'react'

import { Address } from '@xchainjs/xchain-client'
import {
  formatBN,
  BaseAmount,
  Asset,
  baseToAsset,
  formatAssetAmountCurrency,
  baseAmount,
  AssetRuneNative,
  formatAssetAmount
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'
import { AssetWithDecimal } from '../../../types/asgardex'
import { TooltipAddress } from '../common/Common.styles'
import * as Styled from './PoolShare.styles'
import { PoolShareCard } from './PoolShareCard'

export type Props = {
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
  addresses: { rune: O.Option<Address>; asset: O.Option<Address> }
  smallWidth?: boolean
  loading?: boolean
}

export const PoolShare: React.FC<Props> = (props): JSX.Element => {
  const {
    asset: assetWD,
    addresses: { rune: oRuneAddress, asset: oAssetAddress },
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

  const runeAddress = FP.pipe(
    oRuneAddress,
    O.getOrElse(() => '')
  )

  const assetAddress = FP.pipe(
    oAssetAddress,
    O.getOrElse(() => '')
  )

  const totalDepositPrice = useMemo(
    () => baseAmount(runePrice.amount().plus(assetPrice.amount())),
    [assetPrice, runePrice]
  )

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
            <TooltipAddress title={assetAddress}>
              <Col span={12}>
                <Styled.RedemptionAsset asset={asset} />
              </Col>
            </TooltipAddress>
            <TooltipAddress title={runeAddress}>
              <Col span={12}>
                <Styled.RedemptionAsset asset={AssetRuneNative} />
              </Col>
            </TooltipAddress>
          </Styled.CardRow>
        </Styled.RedemptionHeader>
        <Styled.CardRow>
          {renderRedemptionCol(assetShare, assetPrice, asset)}
          {renderRedemptionCol(runeShare, runePrice, AssetRuneNative)}
        </Styled.CardRow>
      </>
    ),
    [runeAddress, assetAddress, asset, renderRedemptionCol, runeShare, runePrice, assetShare, assetPrice]
  )

  const renderRedemptionSmall = useMemo(
    () => (
      <>
        <Styled.RedemptionHeader>
          <TooltipAddress title={assetAddress}>
            <Styled.CardRow>
              <Col span={24}>
                <Styled.RedemptionAsset asset={asset} />
              </Col>
            </Styled.CardRow>
          </TooltipAddress>
        </Styled.RedemptionHeader>
        <Styled.CardRow>{renderRedemptionCol(runeShare, runePrice, AssetRuneNative)}</Styled.CardRow>
        <Styled.RedemptionHeader>
          <TooltipAddress title={runeAddress}>
            <Styled.CardRow>
              <Col span={24}>
                <Styled.RedemptionAsset asset={AssetRuneNative} />
              </Col>
            </Styled.CardRow>
          </TooltipAddress>
        </Styled.RedemptionHeader>
        <Styled.CardRow>{renderRedemptionCol(assetShare, assetPrice, asset)}</Styled.CardRow>
      </>
    ),
    [runeAddress, renderRedemptionCol, runeShare, runePrice, assetAddress, asset, assetShare, assetPrice]
  )
  const renderRedemption = useMemo(
    () => (smallWidth ? renderRedemptionSmall : renderRedemptionLarge),
    [renderRedemptionLarge, renderRedemptionSmall, smallWidth]
  )

  const depositUnitsFormatted = useMemo(() => {
    // Convert `depositUnits` to `AssetAmount`
    const amount = baseToAsset(baseAmount(depositUnits, THORCHAIN_DECIMAL))
    // and format it
    return formatAssetAmount({ amount, decimal: 2 })
  }, [depositUnits])

  return (
    <Styled.PoolShareWrapper ref={ref}>
      <PoolShareCard title={intl.formatMessage({ id: 'deposit.share.title' })}>
        <Styled.CardRow>
          <Col span={smallWidth ? 24 : 12} style={{ paddingBottom: smallWidth ? '20px' : '0' }}>
            <Styled.LabelSecondary textTransform="uppercase">
              {intl.formatMessage({ id: 'deposit.share.units' })}
            </Styled.LabelSecondary>
            <Styled.LabelPrimary loading={loading}>{depositUnitsFormatted}</Styled.LabelPrimary>
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
