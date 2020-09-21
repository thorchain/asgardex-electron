import React from 'react'

import { AssetAmount, formatAssetAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

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
  returnToDate: number
  basePriceAsset: string
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

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus trend={depthTrend} label={intl.formatMessage({ id: 'stake.poolDetails.depth' })}>
          {basePriceAsset} {formatAssetAmount(depth)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus trend={volume24hrTrend} label={intl.formatMessage({ id: 'stake.poolDetails.24hvol' })}>
          {basePriceAsset} {formatAssetAmount(volume24hr)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus trend={allTimeVolumeTrend} label={intl.formatMessage({ id: 'stake.poolDetails.allTimeVal' })}>
          {basePriceAsset} {formatAssetAmount(allTimeVolume)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus trend={totalSwapsTrend} label={intl.formatMessage({ id: 'stake.poolDetails.totalSwaps' })}>
          {totalSwaps}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus trend={totalStakersTrend} label={intl.formatMessage({ id: 'stake.poolDetails.totalStakers' })}>
          {totalStakers}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus label={intl.formatMessage({ id: 'stake.poolDetails.returnToDate' })}>
          {returnToDate + '%'}
        </PoolStatus>
      </Styled.Col>
    </Styled.Container>
  )
}
