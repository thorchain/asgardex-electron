import React from 'react'

import {
  BaseAmount,
  formatAssetAmountCurrency,
  baseToAsset,
  formatAssetAmount,
  baseAmount,
  Asset
} from '@thorchain/asgardex-util'

import Label from '../../label'
import AssetIcon from '../assetIcon'
import { CoinDataWrapper, CoinDataWrapperType, CoinDataWrapperSize } from './AssetData.style'

type Props = {
  asset: Asset
  assetValue?: BaseAmount
  target?: Asset
  targetValue?: BaseAmount
  price?: BaseAmount
  priceValid?: boolean
  size?: CoinDataWrapperSize
  type?: CoinDataWrapperType
}

const AssetData: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    asset,
    assetValue,
    target,
    targetValue,
    price = baseAmount(0),
    priceValid = true,
    size = 'small',
    type = 'normal'
  } = props

  const formattedPrice = formatAssetAmountCurrency(baseToAsset(price))
  // @TODO add valid formatters
  const priceLabel = priceValid && formattedPrice !== '$ 0.00' ? formattedPrice : ''

  const assetTicker = asset.ticker ?? 'unknown'
  const targetTicker = target?.ticker ?? 'unknown'

  return (
    <CoinDataWrapper size={size} type={type}>
      {asset && <AssetIcon className="coinData-coin-avatar" asset={asset} size={size} />}
      <div className="coinData-asset-info">
        <Label className="coinData-asset-label" weight="600">
          {`${assetTicker} ${target ? ':' : ''}`}
        </Label>
        {assetValue && (
          <Label className="coinData-asset-value" weight="600">
            {formatAssetAmount(baseToAsset(assetValue))}
          </Label>
        )}
      </div>
      {target && (
        <div className="coinData-target-info">
          <Label className="coinData-target-label" weight="600">
            {targetTicker}
          </Label>
          {targetValue && (
            <Label className="coinData-target-value" weight="600">
              {formatAssetAmount(baseToAsset(targetValue))}
            </Label>
          )}
        </div>
      )}
      <div className="asset-price-info">
        <Label size="small" color="gray" weight="bold">
          {priceLabel}
        </Label>
      </div>
    </CoinDataWrapper>
  )
}

export default AssetData
