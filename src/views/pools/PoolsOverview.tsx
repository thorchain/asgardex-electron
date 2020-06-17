import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Grid, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import ErrorView from '../../components/shared/error/ErrorView'
import Button from '../../components/uielements/button'
import Coin from '../../components/uielements/coins/coin'
import Label from '../../components/uielements/label'
import Table from '../../components/uielements/table'
import Trend from '../../components/uielements/trend'
import { RUNE_PRICE_POOL } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getPoolTableRowsData, hasPendingPools } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { PoolsState } from '../../services/midgard/types'
import { selectedPricePoolSelector } from '../../services/midgard/utils'
import { PoolDetailStatusEnum } from '../../types/generated/midgard'
import View from '../View'
import { ActionColumn, TableAction, BlockLeftLabel } from './PoolsOverview.style'
import { PoolTableRowData, PoolTableRowsData, PricePoolAsset, PoolAsset } from './types'

type Props = {}

const PoolsOverview: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { service: midgardService } = useMidgardContext()
  const poolsRD = useObservableState(midgardService.poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<Option<PricePoolAsset>>(
    midgardService.selectedPricePoolAsset$,
    some(PoolAsset.RUNE)
  )
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
  const previousPools = useRef<Option<PoolTableRowsData>>(none)
  // store previous data of pending pools to render these while reloading
  const previousPendingPools = useRef<Option<PoolTableRowsData>>(none)

  const pendingCountdownHandler = useCallback(() => {
    midgardService.reloadNetworkInfo()
  }, [midgardService])

  const pendingCountdownInterval = useMemo(() => {
    const pools = RD.toNullable(poolsRD)
    // start countdown if we do have pending pools available only
    return pools && hasPendingPools(pools.poolDetails) ? 5000 : INACTIVE_INTERVAL
  }, [poolsRD])

  useInterval(pendingCountdownHandler, pendingCountdownInterval)

  const pricePool = useMemo(() => {
    const pools = RD.toNullable(poolsRD)
    const pricePools = pools && O.toNullable(pools.pricePools)
    return (pricePools && selectedPricePoolSelector(pricePools, selectedPricePoolAsset)) || RUNE_PRICE_POOL
  }, [poolsRD, selectedPricePoolAsset])

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
    render: (_: string, record: PoolTableRowData) => {
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

  const poolColumn: ColumnType<PoolTableRowData> = {
    key: 'pool',
    title: 'pool',
    dataIndex: 'pool',
    width: 100,
    render: ({ target }: { asset: string; target: string }) => <Coin type="rune" over={target} />
  }

  const poolColumnMobile: ColumnType<PoolTableRowData> = {
    key: 'pool',
    title: 'pool',
    dataIndex: 'pool',
    render: ({ target }: { asset: string; target: string }) => (
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <Coin type="rune" over={target} />
      </Row>
    )
  }

  const assetColumn: ColumnType<PoolTableRowData> = {
    key: 'asset',
    title: 'asset',
    dataIndex: 'pool',
    render: ({ target }: { target: string }) => <Label>{target}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => a.pool.target.localeCompare(b.pool.target),
    sortDirections: ['descend', 'ascend']
  }

  const priceColumn: ColumnType<PoolTableRowData> = {
    key: 'poolprice',
    title: 'price',
    dataIndex: 'poolPrice',
    render: (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset, 3)}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => {
      const aAmount = a.poolPrice.amount()
      const bAmount = b.poolPrice.amount()
      return aAmount.minus(bAmount).toNumber()
    },
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend'
  }

  const depthColumn: ColumnType<PoolTableRowData> = {
    key: 'depth',
    title: 'depth',
    dataIndex: 'depthPrice',
    render: (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset)}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => {
      const aAmount = a.depthPrice.amount()
      const bAmount = b.depthPrice.amount()
      return aAmount.minus(bAmount).toNumber()
    },
    sortDirections: ['descend', 'ascend']
  }

  const volumeColumn: ColumnType<PoolTableRowData> = {
    key: 'vol',
    title: '24h vol',
    dataIndex: 'volumePrice',
    render: (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset)}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => {
      const aAmount = a.volumePrice.amount()
      const bAmount = b.volumePrice.amount()
      return aAmount.minus(bAmount).toNumber()
    },
    sortDirections: ['descend', 'ascend']
  }

  const transactionColumn: ColumnType<PoolTableRowData> = {
    key: 'transaction',
    title: 'avg. size',
    dataIndex: 'transactionPrice',
    render: (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset)}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => {
      const aAmount = a.transactionPrice.amount()
      const bAmount = b.transactionPrice.amount()
      return aAmount.minus(bAmount).toNumber()
    },
    sortDirections: ['descend', 'ascend']
  }

  const slipColumn: ColumnType<PoolTableRowData> = {
    key: 'slip',
    title: 'avg. slip',
    dataIndex: 'slip',
    render: (slip: BigNumber) => <Trend amount={slip} />,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => a.slip.minus(b.slip).toNumber(),
    sortDirections: ['descend', 'ascend']
  }

  const tradeColumn: ColumnType<PoolTableRowData> = {
    key: 'trade',
    title: 'trades',
    dataIndex: 'trades',
    render: (trades: BigNumber) => <Label>{trades.toString()}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => {
      const aAmount = a.trades
      const bAmount = b.trades
      return aAmount.minus(bAmount).toNumber()
    },
    sortDirections: ['descend', 'ascend']
  }

  const desktopPoolsColumns: ColumnsType<PoolTableRowData> = [
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

  const mobilePoolsColumns: ColumnsType<PoolTableRowData> = [poolColumnMobile, btnPoolsColumn]

  const renderPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
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
            const pools = O.getOrElse(() => [] as PoolTableRowsData)(previousPools.current)
            return renderPoolsTable(pools, true)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          // success state
          (pools: PoolsState): JSX.Element => {
            const poolViewData = getPoolTableRowsData(
              pools.poolDetails,
              pricePool.poolData,
              PoolDetailStatusEnum.Enabled
            )
            previousPools.current = some(poolViewData)
            return renderPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [poolsRD, pricePool, renderPoolsTable]
  )

  const btnPendingPoolsColumn = {
    key: 'btn',
    title: '',
    width: 200,
    render: (_: string, record: PoolTableRowData) => {
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
    render: (_: string, record: PoolTableRowData) => {
      const { deepest } = record

      return (
        <TableAction>
          <BlockLeftLabel>{deepest ? blocksLeft.toString() : ''}</BlockLeftLabel>
        </TableAction>
      )
    }
  }

  const desktopPendingPoolsColumns: ColumnsType<PoolTableRowData> = [
    poolColumn,
    assetColumn,
    priceColumn,
    depthColumn,
    blockLeftColumn,
    btnPendingPoolsColumn
  ]

  const mobilePendingPoolsColumns: ColumnsType<PoolTableRowData> = [poolColumnMobile, btnPendingPoolsColumn]

  const renderPendingPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
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
            const pools = O.getOrElse(() => [] as PoolTableRowsData)(previousPendingPools.current)
            return renderPendingPoolsTable(pools, true)
          },
          // error state - we just show an empty table, an error will be shown on pools table
          (_: Error) => renderPendingPoolsTable([]),
          // success state
          (state: PoolsState): JSX.Element => {
            const poolViewData = getPoolTableRowsData(
              state.poolDetails,
              pricePool.poolData,
              PoolDetailStatusEnum.Bootstrapped
            )
            previousPendingPools.current = some(poolViewData)
            return renderPendingPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [poolsRD, renderPendingPoolsTable, pricePool]
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
