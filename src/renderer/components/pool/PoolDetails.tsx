import React, { useMemo } from 'react'

import { Asset } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'

import { Network } from '../../../shared/api/types'
import { EarningsHistoryItemPool, PoolDetail, PoolStatsDetail } from '../../types/generated/midgard/models'
import { stringToGetPoolsStatus } from '../../views/pools/Pools.utils'
import { PoolCards } from './PoolCards'
import * as H from './PoolDetails.helpers'
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
  disableTradingPoolAction: boolean
  disableAllPoolActions: boolean
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
  disableTradingPoolAction,
  disableAllPoolActions,
  network
}) => {
  const price = useMemo(() => H.getPrice(poolDetail, priceRatio), [poolDetail, priceRatio])
  return (
    <A.Row gutter={[0, 8]}>
      <A.Col span={24}>
        <PoolTitle
          network={network}
          disableAllPoolActions={disableAllPoolActions}
          disableTradingPoolAction={disableTradingPoolAction}
          asset={O.some(asset)}
          price={price}
          priceSymbol={priceSymbol}
          isLoading={isLoading}
          status={stringToGetPoolsStatus(poolDetail.status)}
        />
      </A.Col>
      <A.Col xs={24} md={8}>
        <PoolCards
          poolStatsDetail={poolStatsDetail}
          priceRatio={priceRatio}
          poolDetail={poolDetail}
          priceSymbol={priceSymbol}
          isLoading={isLoading}
        />
      </A.Col>
      <A.Col xs={24} md={16}>
        <ChartView priceRatio={priceRatio} />
      </A.Col>
      <A.Col span={24}>
        <HistoryView poolAsset={asset} />
      </A.Col>
    </A.Row>
  )
}
