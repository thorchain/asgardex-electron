import React from 'react'

import { Asset, AssetAmount } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'

import { PoolCards } from './PoolCards'
import { PoolChart } from './PoolChart'
import * as Styled from './PoolDetails.style'
import { PoolHistory } from './PoolHistory'
import { PoolTitle } from './PoolTitle'

export type Props = {
  asset: O.Option<Asset>
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
  priceUSD: AssetAmount
  priceSymbol?: string
  isLoading?: boolean
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  depth,
  volume24hr,
  allTimeVolume,
  totalStakers,
  totalSwaps,
  priceUSD,
  priceSymbol = '',
  depthTrend,
  volume24hrTrend,
  allTimeVolumeTrend,
  totalSwapsTrend,
  totalStakersTrend,
  isLoading
}) => {
  return (
    <Styled.Container>
      <A.Col span={24}>
        <PoolTitle asset={asset} priceUSD={priceUSD} isLoading={isLoading} />
      </A.Col>
      <A.Col xs={24} md={8}>
        <PoolCards
          depth={depth}
          volume24hr={volume24hr}
          allTimeVolume={allTimeVolume}
          totalStakers={totalStakers}
          totalSwaps={totalSwaps}
          priceSymbol={priceSymbol}
          depthTrend={depthTrend}
          volume24hrTrend={volume24hrTrend}
          allTimeVolumeTrend={allTimeVolumeTrend}
          totalSwapsTrend={totalSwapsTrend}
          totalStakersTrend={totalStakersTrend}
          isLoading={isLoading}
        />
      </A.Col>
      <A.Col xs={24} md={16}>
        <PoolChart isLoading={isLoading} />
      </A.Col>
      <A.Col span={24}>
        <PoolHistory isLoading={isLoading} />
      </A.Col>
    </Styled.Container>
  )
}
