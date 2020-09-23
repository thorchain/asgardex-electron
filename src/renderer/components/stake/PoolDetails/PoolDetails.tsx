import React, { useMemo } from 'react'

import { AssetAmount, formatAssetAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { getCurrencySymbolByAssetString } from '../../../helpers/assetHelper'
import { abbreviateNumber } from '../../../helpers/numberHelper'
import { PricePoolAsset } from '../../../views/pools/types'
import PoolStatus from '../../uielements/poolStatus'
import * as Styled from './PoolDetails.style'

type Props = {
  depth: AssetAmount
  depthTrend?: BigNumber
  volume24hr: AssetAmount
  volume24hrTrend?: BigNumber
  allTimeVolume: AssetAmount
  allTimeVolumeTrend?: BigNumber
  totalSwaps: number
  totalSwapsTrend?: BigNumber
  totalStakers: number
  totalStakersTrend?: BigNumber
  // decimal value in percents
  returnToDate: string
  basePriceAsset: PricePoolAsset
}

export const PoolDetails: React.FC<Props> = ({
  depth,
  volume24hr,
  allTimeVolume,
  totalStakers,
  totalSwaps,
  returnToDate,
  basePriceAsset,
  depthTrend,
  volume24hrTrend,
  allTimeVolumeTrend,
  totalSwapsTrend,
  totalStakersTrend
}) => {
  const intl = useIntl()

  const priceSymbol = useMemo(() => getCurrencySymbolByAssetString(basePriceAsset), [basePriceAsset])

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus
          fullValue={`${priceSymbol} ${formatAssetAmount(depth)}`}
          trend={depthTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.depth' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(depth.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          fullValue={`${priceSymbol} ${formatAssetAmount(volume24hr)}`}
          trend={volume24hrTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.24hvol' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(volume24hr.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          fullValue={`${priceSymbol} ${formatAssetAmount(allTimeVolume)}`}
          trend={allTimeVolumeTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.allTimeVal' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(allTimeVolume.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          fullValue={`${totalSwaps}`}
          trend={totalSwapsTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.totalSwaps' })}
          displayValue={abbreviateNumber(totalSwaps)}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          trend={totalStakersTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.totalStakers' })}
          displayValue={abbreviateNumber(totalStakers)}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          label={intl.formatMessage({ id: 'stake.poolDetails.returnToDate' })}
          displayValue={returnToDate + '%'}
        />
      </Styled.Col>
    </Styled.Container>
  )
}
