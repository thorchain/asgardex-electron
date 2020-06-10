import React from 'react'

import { TokenAmount, formatTokenAmount } from '@thorchain/asgardex-token'
import { bn, formatBN } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'

import { Maybe, Nothing } from '../../../../types/asgardex.d'
import Label from '../../label'
import Coin from '../coin'
import { CoinDataWrapper, CoinDataWrapperType, CoinDataWrapperSize } from './CoinData.style'

type Props = {
  'data-test'?: string
  asset?: Maybe<string>
  assetValue?: Maybe<TokenAmount>
  target?: Maybe<string>
  targetValue?: Maybe<TokenAmount>
  price?: BigNumber
  priceUnit?: string
  priceValid?: boolean
  size?: CoinDataWrapperSize
  className?: string
  type?: CoinDataWrapperType | undefined
}

const CoinData: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    asset = 'bnb',
    assetValue = Nothing,
    target = Nothing,
    targetValue = Nothing,
    price = bn(0),
    priceUnit = 'RUNE',
    priceValid = true,
    size = 'small',
    className = '',
    type = 'normal',
    ...otherProps
  } = props

  const priceLabel = priceValid ? `${priceUnit.toUpperCase()} ${formatBN(price)}` : 'NOT LISTED'

  return (
    <CoinDataWrapper
      size={size}
      target={target}
      type={type}
      className={`coinData-wrapper ${className}`}
      {...otherProps}>
      <Coin className="coinData-coin-avatar" type={asset} over={target} size={size} />
      <div className="coinData-asset-info" data-test="coin-data-asset-info">
        <Label className="coinData-asset-label" data-test="coin-data-asset-label" weight="600">
          {`${asset} ${target ? ':' : ''}`}
        </Label>
        {assetValue && (
          <Label className="coinData-asset-value" data-test="coin-data-asset-value" weight="600">
            {formatTokenAmount(assetValue)}
          </Label>
        )}
      </div>
      {target && (
        <div className="coinData-target-info">
          <Label className="coinData-target-label" weight="600">
            {target}
          </Label>
          {targetValue && (
            <Label className="coinData-target-value" weight="600">
              {formatTokenAmount(targetValue)}
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

export default CoinData
