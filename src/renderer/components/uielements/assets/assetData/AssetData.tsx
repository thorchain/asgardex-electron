import React from 'react'

import { BaseAmount, formatAssetAmountCurrency, baseToAsset, baseAmount, Asset } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { walletTypeToI18n } from '../../../../services/wallet/util'
import { PricePoolAsset } from '../../../../views/pools/Pools.types'
import * as Styled from './AssetData.styles'

/**
 * AssetData - Component to show data of an asset:
 *
 * |------|---------|-------------------|------------------|------------------------|
 * | icon | ticker  | amount (optional) | price (optional) | wallet type (optional) |
 * |------|---------|-------------------|------------------|------------------------|
 *
 */

export type Props = {
  asset: Asset
  walletType?: WalletType
  noTicker?: boolean
  amount?: BaseAmount
  price?: BaseAmount
  priceAsset?: PricePoolAsset
  size?: Styled.AssetDataSize
  // `className` is needed by `styled components`
  className?: string
  network: Network
}

export const AssetData: React.FC<Props> = (props): JSX.Element => {
  const {
    asset,
    walletType,
    amount: assetAmount,
    noTicker = false,
    price = baseAmount(0),
    priceAsset,
    size = 'small',
    className,
    network
  } = props

  const intl = useIntl()
  const priceLabel = priceAsset
    ? formatAssetAmountCurrency({ amount: baseToAsset(price), asset: priceAsset, trimZeros: true })
    : ''

  return (
    <Styled.Wrapper className={className}>
      <Styled.AssetIconContainer>
        <Styled.AssetIcon asset={asset} size={size} network={network} />
      </Styled.AssetIconContainer>
      {!noTicker && (
        <Styled.LabelContainer>
          <Styled.TickerLabel>{asset.ticker}</Styled.TickerLabel>
          <Styled.ChainLabel>{asset.chain}</Styled.ChainLabel>
          {walletType && isLedgerWallet(walletType) && (
            <Styled.WalletTypeLabel>{walletTypeToI18n(walletType, intl)}</Styled.WalletTypeLabel>
          )}
        </Styled.LabelContainer>
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
