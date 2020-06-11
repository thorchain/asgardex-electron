import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { bn } from '@thorchain/asgardex-util'
import { Grid, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import ErrorView from '../../components/shared/error/ErrorView'
import Button from '../../components/uielements/button'
import Coin from '../../components/uielements/coins/coin'
import Label from '../../components/uielements/label'
import Table from '../../components/uielements/table'
import Trend from '../../components/uielements/trend'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getPoolViewData, hasPendingPools } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { PoolsState } from '../../services/midgard/types'
import { Maybe, Nothing } from '../../types/asgardex.d'
import { PoolDetailStatusEnum } from '../../types/generated/midgard'
import View from '../View'
import { ActionColumn, TableAction, BlockLeftLabel } from './PoolsOverview.style'
import { PoolRowType, PoolRowTypeList } from './types'

type Props = {}

const PoolsOverview: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { service: midgardService } = useMidgardContext()
  const poolsRD = useObservableState(midgardService.poolState$, RD.pending)
  const networkInfoRD = useObservableState(midgardService.networkInfo$, RD.pending)

  const [blocksLeft, setBlocksLeft] = useState('')

  useEffect(() => {
    const networkInfo = RD.toNullable(networkInfoRD)
    if (networkInfo) {
      setBlocksLeft(networkInfo?.poolActivationCountdown?.toString() ?? '')
    }
  }, [networkInfoRD])

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pools to render these while reloading
  const previousPools = useRef<Maybe<PoolRowTypeList>>(Nothing)
  // store previous data of pending pools to render these while reloading
  const previousPendingPools = useRef<Maybe<PoolRowTypeList>>(Nothing)

  const pendingCountdownHandler = useCallback(() => {
    midgardService.reloadNetworkInfo()
  }, [midgardService])

  const pendingCountdownInterval = useMemo(() => {
    const pools = RD.toNullable(poolsRD)
    // start countdown if we do have pending pools available only
    return pools && hasPendingPools(pools.poolDetails) ? 5000 : INACTIVE_INTERVAL
  }, [poolsRD])

  useInterval(pendingCountdownHandler, pendingCountdownInterval)

  const clickSwapHandler = (p: SwapRouteParams) => {
    history.push(swapRoutes.swap.path(p))
  }

  const clickStakeHandler = (asset: string) => {
    history.push(stakeRoutes.stake.path({ asset }))
  }

  const clickRefreshHandler = () => {
    midgardService.reloadPoolsState()
    midgardService.reloadNetworkInfo()
  }

  const renderBtnColTitle = () => (
    <ActionColumn>
      <Button onClick={clickRefreshHandler} typevalue="outline">
        <SyncOutlined />
        refresh
      </Button>
    </ActionColumn>
  )

  const btnPoolsColumn = {
    key: 'btn',
    title: renderBtnColTitle,
    width: 280,
    render: (_: string, record: PoolRowType) => {
      const {
        pool: { asset, target }
      } = record

      return (
        <TableAction>
          <Button round="true" onClick={() => clickStakeHandler(target)} typevalue="outline">
            <PlusOutlined />
            liquidity
          </Button>
          <Button round="true" onClick={() => clickSwapHandler({ source: asset, target })}>
            <SwapOutlined />
            swap
          </Button>
        </TableAction>
      )
    }
  }

  const poolColumn: ColumnType<PoolRowType> = {
    key: 'pool',
    title: 'pool',
    dataIndex: 'pool',
    width: 100,
    render: ({ target }: { asset: string; target: string }) => <Coin type="rune" over={target} />
  }

  const poolColumnMobile: ColumnType<PoolRowType> = {
    key: 'pool',
    title: 'pool',
    dataIndex: 'pool',
    render: ({ target }: { asset: string; target: string }) => (
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <Coin type="rune" over={target} />
      </Row>
    )
  }

  const assetColumn: ColumnType<PoolRowType> = {
    key: 'asset',
    title: 'asset',
    dataIndex: 'pool',
    render: ({ target }: { target: string }) => <Label>{target}</Label>,
    sorter: (a: PoolRowType, b: PoolRowType) => a.pool.target.localeCompare(b.pool.target),
    sortDirections: ['descend', 'ascend']
  }

  const priceColumn: ColumnType<PoolRowType> = {
    key: 'poolprice',
    title: 'price',
    dataIndex: 'poolPrice',
    sorter: (a: PoolRowType, b: PoolRowType) => a.raw.poolPrice.minus(b.raw.poolPrice).toNumber(),
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend'
  }

  const depthColumn: ColumnType<PoolRowType> = {
    key: 'depth',
    title: 'depth',
    dataIndex: 'depth',
    sorter: (a: PoolRowType, b: PoolRowType) => a.raw.depth.minus(b.raw.depth).toNumber(),
    sortDirections: ['descend', 'ascend']
  }

  const volumeColumn: ColumnType<PoolRowType> = {
    key: 'vol',
    title: '24h vol',
    dataIndex: 'volume',
    sorter: (a: PoolRowType, b: PoolRowType) => a.raw.volume.minus(b.raw.volume).toNumber(),
    sortDirections: ['descend', 'ascend']
  }

  const transactionColumn: ColumnType<PoolRowType> = {
    key: 'transaction',
    title: 'avg. size',
    dataIndex: 'transaction',
    sorter: (a: PoolRowType, b: PoolRowType) => a.raw.transaction.minus(b.raw.transaction).toNumber(),
    sortDirections: ['descend', 'ascend']
  }

  const slipColumn: ColumnType<PoolRowType> = {
    key: 'slip',
    title: 'avg. slip',
    dataIndex: 'slip',
    render: (slip: string) => <Trend amount={bn(slip)} />,
    sorter: (a: PoolRowType, b: PoolRowType) => a.raw.slip.minus(b.raw.slip).toNumber(),
    sortDirections: ['descend', 'ascend']
  }

  const tradeColumn: ColumnType<PoolRowType> = {
    key: 'trade',
    title: 'trades',
    dataIndex: 'trade',
    sorter: (a: PoolRowType, b: PoolRowType) => a.raw.trade.minus(b.raw.trade).toNumber(),
    sortDirections: ['descend', 'ascend']
  }

  const desktopPoolsColumns: ColumnsType<PoolRowType> = [
    poolColumn,
    assetColumn,
    priceColumn,
    depthColumn,
    volumeColumn,
    transactionColumn,
    slipColumn,
    tradeColumn,
    btnPoolsColumn
  ]

  const mobilePoolsColumns: ColumnsType<PoolRowType> = [poolColumnMobile, btnPoolsColumn]

  const renderPoolsTable = useCallback(
    (tableData: PoolRowType[], loading = false) => {
      const columns = isDesktopView ? desktopPoolsColumns : mobilePoolsColumns
      return <Table columns={columns} dataSource={tableData} loading={loading} rowKey="key" />
    },
    [isDesktopView, desktopPoolsColumns, mobilePoolsColumns]
  )

  const renderPools = useMemo(
    () => (
      <>
        {RD.fold(
          // initial state
          () => renderPoolsTable([], true),
          // loading state
          () => {
            const pools = previousPools.current || []
            return renderPoolsTable(pools, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          // success state
          (pools: PoolsState): JSX.Element => {
            const poolViewData = getPoolViewData(pools, PoolDetailStatusEnum.Enabled)
            previousPools.current = poolViewData
            return renderPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [poolsRD, renderPoolsTable]
  )

  const btnPendingPoolsColumn = {
    key: 'btn',
    title: '',
    width: 200,
    render: (_: string, record: PoolRowType) => {
      const {
        pool: { target }
      } = record

      return (
        <TableAction>
          <Button round="true" onClick={() => clickStakeHandler(target)} typevalue="outline">
            <PlusOutlined />
            liquidity
          </Button>
        </TableAction>
      )
    }
  }

  const blockLeftColumn = {
    key: 'blocks',
    title: 'blocks left',
    width: 80,
    render: (_: string, record: PoolRowType) => {
      const { deepest } = record

      return (
        <TableAction>
          <BlockLeftLabel size="normal">{deepest ? blocksLeft.toString() : ''}</BlockLeftLabel>
        </TableAction>
      )
    }
  }

  const desktopPendingPoolsColumns: ColumnsType<PoolRowType> = [
    poolColumn,
    assetColumn,
    priceColumn,
    depthColumn,
    blockLeftColumn,
    btnPendingPoolsColumn
  ]

  const mobilePendingPoolsColumns: ColumnsType<PoolRowType> = [poolColumnMobile, btnPendingPoolsColumn]

  const renderPendingPoolsTable = useCallback(
    (tableData: PoolRowType[], loading = false) => {
      const columns = isDesktopView ? desktopPendingPoolsColumns : mobilePendingPoolsColumns
      return <Table columns={columns} dataSource={tableData} loading={loading} rowKey="key" />
    },
    [isDesktopView, desktopPendingPoolsColumns, mobilePendingPoolsColumns]
  )

  const renderPendingPools = useMemo(
    () => (
      <>
        {RD.fold(
          // initial state
          () => renderPendingPoolsTable([], true),
          // loading state
          () => {
            const pools = previousPendingPools.current || []
            return renderPendingPoolsTable(pools, true)
          },
          // error state - we just show an empty table, an error will be shown on pools table
          (_: Error) => renderPendingPoolsTable([]),
          // success state
          (pools: PoolsState): JSX.Element => {
            const poolViewData = getPoolViewData(pools, PoolDetailStatusEnum.Bootstrapped)
            previousPendingPools.current = poolViewData
            return renderPendingPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [poolsRD, renderPendingPoolsTable]
  )

  return (
    <View>
      <Label size="big" weight="bold" color="normal" textTransform="uppercase">
        Available Pools
      </Label>
      {renderPools}
      <Label size="big" weight="bold" color="normal" textTransform="uppercase" style={{ marginTop: '40px' }}>
        Pending Pools
      </Label>
      {renderPendingPools}
    </View>
  )
}

export default PoolsOverview
