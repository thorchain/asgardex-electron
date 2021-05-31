import React, { useMemo } from 'react'

import { Asset, Chain } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'

import { Network } from '../../../shared/api/types'
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
  haltedChains?: Chain[]
  network: Network
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  priceSymbol = '',
  priceRatio,
  poolDetail,
  poolStatsDetail,
  isLoading,
  HistoryView,
  ChartView,
  haltedChains,
  network
}) => {
  const price = useMemo(() => H.getPrice(poolDetail, priceRatio), [poolDetail, priceRatio])
  return (
    <Styled.Container>
      <Styled.Section>
        <A.Col span={24}>
          <PoolTitle
            network={network}
            haltedChains={haltedChains}
            asset={O.some(asset)}
            price={price}
            priceSymbol={priceSymbol}
            isLoading={isLoading}
          />
        </A.Col>
      </Styled.Section>
      <Styled.Section>
        <A.Col xs={24} md={8}>
          <PoolCards
            poolStatsDetail={poolStatsDetail}
            priceRatio={priceRatio}
            poolDetail={poolDetail}
            priceSymbol={priceSymbol}
            isLoading={isLoading}
          />
        </A.Col>
        <Styled.ColumnSpace />
        <A.Col xs={24} md={16}>
          <ChartView priceRatio={priceRatio} />
        </A.Col>
      </Styled.Section>
      <Styled.Section>
        <A.Col span={24}>
          <HistoryView poolAsset={asset} />
        </A.Col>
      </Styled.Section>
    </Styled.Container>
  )
}
