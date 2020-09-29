import React from 'react'

import { AssetAmount, formatAssetAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { abbreviateNumber } from '../../../helpers/numberHelper'
import PoolStatus from '../../uielements/poolStatus'
import * as Styled from './PoolDetails.style'

export type Props = {
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
  priceSymbol?: string
  isLoading?: boolean
}

export const PoolDetails: React.FC<Props> = ({
  depth,
  volume24hr,
  allTimeVolume,
  totalStakers,
  totalSwaps,
  returnToDate,
  priceSymbol = '',
  depthTrend,
  volume24hrTrend,
  allTimeVolumeTrend,
  totalSwapsTrend,
  totalStakersTrend,
  isLoading
}) => {
  const intl = useIntl()

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount(depth)}`}
          trend={depthTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.depth' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(depth.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount(volume24hr)}`}
          trend={volume24hrTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.24hvol' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(volume24hr.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${priceSymbol} ${formatAssetAmount(allTimeVolume)}`}
          trend={allTimeVolumeTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.allTimeVal' })}
          displayValue={`${priceSymbol} ${abbreviateNumber(allTimeVolume.amount().toNumber(), 2)}`}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          fullValue={`${totalSwaps}`}
          trend={totalSwapsTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.totalSwaps' })}
          displayValue={abbreviateNumber(totalSwaps)}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          trend={totalStakersTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.totalStakers' })}
          displayValue={abbreviateNumber(totalStakers)}
        />
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          isLoading={isLoading}
          label={intl.formatMessage({ id: 'stake.poolDetails.returnToDate' })}
          displayValue={returnToDate + '%'}
        />
      </Styled.Col>
    </Styled.Container>
  )
}
