import React from 'react'

import Coin from '../../coins/coin'
import { CoinSize } from '../../coins/coin/types'
import { AssetDataWrapper } from './AssetData.style'

type Props = {
  asset: string
  assetValue?: number
  price?: number
  priceValue?: string
  priceUnit: string
  size?: CoinSize
  className?: string
}

const AssetData: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, priceValue, priceUnit, size = 'big', className = '' } = props

  return (
    <AssetDataWrapper className={`assetData-wrapper ${className}`}>
      <Coin className="coinData-coin-avatar" type={asset} size={size} />
      <div className="coinData-asset-label">{asset}</div>
      <div className="asset-price-info">
        {priceUnit} {priceValue}
      </div>
    </AssetDataWrapper>
  )
}

export default AssetData
