import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset } from '@xchainjs/xchain-util'
import * as A from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../shared/api/types'
import { PoolDetailRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { GetPoolsPeriodEnum, GetPoolsStatusEnum } from '../../types/generated/midgard'
import { PoolHistoryActions } from '../../views/pool/PoolHistoryView.types'
import { PoolCards } from './PoolCards'
import * as H from './PoolDetails.helpers'
import { PoolTitle } from './PoolTitle'

export type Props = {
  asset: Asset
  watched: boolean
  watch: FP.Lazy<void>
  unwatch: FP.Lazy<void>
  historyActions: PoolHistoryActions
  poolStatsDetail: PoolStatsDetailRD
  reloadPoolStatsDetail: FP.Lazy<void>
  poolDetail: PoolDetailRD
  reloadPoolDetail: FP.Lazy<void>
  priceRatio: BigNumber
  priceSymbol: string
  HistoryView: React.ComponentType<{
    poolAsset: Asset
    historyActions: PoolHistoryActions
  }>
  ChartView: React.ComponentType<{ priceRatio: BigNumber }>
  network: Network
  poolsPeriod: GetPoolsPeriodEnum
  setPoolsPeriod: (v: GetPoolsPeriodEnum) => void
}

export const PoolDetails: React.FC<Props> = ({
  asset,
  watched,
  watch,
  unwatch,
  historyActions,
  priceSymbol,
  priceRatio,
  poolDetail: poolDetailRD,
  reloadPoolDetail,
  poolStatsDetail: poolStatsDetailRD,
  reloadPoolStatsDetail,
  HistoryView,
  ChartView,
  network,
  poolsPeriod,
  setPoolsPeriod
}) => {
  const renderTitle = useMemo(() => {
    const price = FP.pipe(
      poolDetailRD,
      RD.map((poolDetail) => ({
        amount: H.getPrice(poolDetail, priceRatio),
        symbol: priceSymbol
      }))
    )

    const isAvailablePool = FP.pipe(
      poolDetailRD,
      RD.map(({ status }) => status === GetPoolsStatusEnum.Available),
      RD.getOrElse(() => false)
    )

    return (
      <PoolTitle
        network={network}
        asset={asset}
        watched={watched}
        watch={watch}
        unwatch={unwatch}
        price={price}
        isAvailablePool={isAvailablePool}
      />
    )
  }, [asset, network, poolDetailRD, priceRatio, priceSymbol, unwatch, watch, watched])

  const reloadPoolCardsData = useCallback(() => {
    reloadPoolStatsDetail()
    reloadPoolDetail()
  }, [reloadPoolDetail, reloadPoolStatsDetail])

  return (
    <A.Row gutter={[0, 8]}>
      <A.Col span={24}>{renderTitle}</A.Col>
      <A.Col xs={24} md={8}>
        <PoolCards
          poolStatsDetail={poolStatsDetailRD}
          priceRatio={priceRatio}
          poolDetail={poolDetailRD}
          priceSymbol={priceSymbol}
          reloadData={reloadPoolCardsData}
          poolsPeriod={poolsPeriod}
          setPoolsPeriod={setPoolsPeriod}
        />
      </A.Col>
      <A.Col xs={24} md={16}>
        <ChartView priceRatio={priceRatio} />
      </A.Col>
      <A.Col span={24}>
        <HistoryView poolAsset={asset} historyActions={historyActions} />
      </A.Col>
    </A.Row>
  )
}
