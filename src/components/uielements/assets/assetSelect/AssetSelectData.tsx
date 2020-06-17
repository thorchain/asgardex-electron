import React from 'react'

import { TokenAmount } from '@thorchain/asgardex-token'
import { bn, formatBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import Coin from '../../coins/coin'
import Label from '../../label'
import { AssetSelectDataWrapper, AssetSelectDataWrapperType, AssetSelectDataWrapperSize } from './AssetSelectData.style'

type Props = {
  asset?: string
  assetValue?: TokenAmount
  target?: string
  targetValue?: TokenAmount
  price?: BigNumber
  priceUnit?: string
  priceValid?: boolean
  size?: AssetSelectDataWrapperSize
  className?: string
  type?: AssetSelectDataWrapperType
}

const AssetSelectData: React.FC<Props> = (props: Props): JSX.Element => {
  const { asset, target, price = bn(0), priceValid = true, size = 'small', className = '', type = 'normal' } = props
  const priceLabel = priceValid ? `$ ${formatBN(price)}` : 'NOT LISTED'

  return (
    <AssetSelectDataWrapper size={size} target={target} type={type} className={`coinData-wrapper ${className}`}>
      {asset && <Coin className="assetSelectData-coin-avatar" type={asset} over={target} size={size} />}
      <div className="assetSelectData-asset-info">
        <Label className="assetSelectData-asset-label" weight="600">
          {`${asset}`}
        </Label>
      </div>
      <div className="asset-price-info">
        <Label size="small" color="gray" weight="bold">
          {priceLabel}
        </Label>
      </div>
    </AssetSelectDataWrapper>
  )
}

export default AssetSelectData
