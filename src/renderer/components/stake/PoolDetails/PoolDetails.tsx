import React, { useMemo } from 'react'

import { Asset, AssetAmount, assetToString, formatAssetAmount } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { getCyrrencySymbolByAssetString } from '../../../const'
import { abbreviateNumber } from '../../../helpers/numberHelper'
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
  basePriceAsset: Asset
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

  const priceSymbol = useMemo(() => getCyrrencySymbolByAssetString(assetToString(basePriceAsset)), [basePriceAsset])

  return (
    <Styled.Container>
      <Styled.Col>
        <PoolStatus
          fullValue={`${priceSymbol} ${formatAssetAmount(depth)}`}
          trend={depthTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.depth' })}>
          {priceSymbol} {abbreviateNumber(depth.amount().toNumber(), 2)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          fullValue={`${priceSymbol} ${formatAssetAmount(volume24hr)}`}
          trend={volume24hrTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.24hvol' })}>
          {priceSymbol} {abbreviateNumber(volume24hr.amount().toNumber(), 2)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus
          fullValue={`${priceSymbol} ${formatAssetAmount(allTimeVolume)}`}
          trend={allTimeVolumeTrend}
          label={intl.formatMessage({ id: 'stake.poolDetails.allTimeVal' })}>
          {priceSymbol} {abbreviateNumber(allTimeVolume.amount().toNumber(), 2)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus trend={totalSwapsTrend} label={intl.formatMessage({ id: 'stake.poolDetails.totalSwaps' })}>
          {abbreviateNumber(totalSwaps)}
        </PoolStatus>
      </Styled.Col>

      <Styled.Col>
        <PoolStatus trend={totalStakersTrend} label={intl.formatMessage({ id: 'stake.poolDetails.totalStakers' })}>
          {abbreviateNumber(totalStakers)}
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
