import React, { useMemo } from 'react'

import { Asset } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'

import { EarningsHistoryItemPool, PoolDetail, PoolStatsDetail } from '../../types/generated/midgard/models'
import { PoolCards } from './PoolCards'
import * as H from './PoolDetails.helpers'
import * as Styled from './PoolDetails.style'
import { PoolTitle } from './PoolTitle'

export type Props = {
  asset: Asset
  poolStatsDetail: PoolStatsDetail
  poolDetail: PoolDetail
  priceRatio: BigNumber
  priceSymbol?: string
  earningsHistory: O.Option<EarningsHistoryItemPool>
  isLoading?: boolean
  HistoryView: React.ComponentType<{ poolAsset: Asset }>
  ChartView: React.ComponentType<{ isLoading?: boolean; priceRatio: BigNumber }>
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  priceSymbol = '',
  earningsHistory,
  priceRatio,
  poolDetail,
  poolStatsDetail,
  isLoading,
  HistoryView,
  ChartView
}) => {
  const price = useMemo(() => H.getPrice(poolDetail, priceRatio), [poolDetail, priceRatio])
  return (
    <Styled.Container>
      <Styled.TopContainer>
        <A.Col span={24}>
          <PoolTitle asset={O.some(asset)} price={price} priceSymbol={priceSymbol} isLoading={isLoading} />
        </A.Col>
        <A.Col xs={24} md={8}>
          <PoolCards
            poolStatsDetail={poolStatsDetail}
            priceRatio={priceRatio}
            poolDetail={poolDetail}
            earningsHistory={earningsHistory}
            priceSymbol={priceSymbol}
            isLoading={isLoading}
          />
        </A.Col>
        <A.Col xs={24} md={16}>
          <ChartView priceRatio={priceRatio} />
        </A.Col>
      </Styled.TopContainer>
      <A.Col span={24}>
        <HistoryView poolAsset={asset} />
      </A.Col>
    </Styled.Container>
  )
}
