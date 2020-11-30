import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { assetToString, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Grid, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { ErrorView } from '../../components/shared/error/'
import { AssetIcon } from '../../components/uielements/assets/assetIcon'
import { Button } from '../../components/uielements/button'
import { Label } from '../../components/uielements/label'
import { Table } from '../../components/uielements/table'
import { Trend } from '../../components/uielements/trend'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { ordBaseAmount, ordBigNumber } from '../../helpers/fp/ord'
import { getDefaultRunePricePool, getPoolTableRowsData, sortByDepth } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as depositRoutes from '../../routes/deposit'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { Network } from '../../services/app/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { PendingPoolsState, PoolsState } from '../../services/midgard/types'
import { PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { getBlocksLeftForPendingPoolAsString } from './Pools.utils'
import { ActionColumn, TableAction, BlockLeftLabel } from './PoolsOverview.style'

export const PoolsOverview: React.FC = (): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)
  const { service: midgardService } = useMidgardContext()
  const {
    thorchainLastblockState$,
    thorchainConstantsState$,
    pools: { poolsState$, pendingPoolsState$, selectedPricePool$, reloadPools, reloadPendingPools },
    reloadThorchainLastblock,
    reloadNetworkInfo
  } = midgardService
  const poolsRD = useObservableState(poolsState$, RD.pending)
  const pendingPoolsRD = useObservableState(pendingPoolsState$, RD.pending)
  const thorchainLastblockRD = useObservableState(thorchainLastblockState$, RD.pending)
  const thorchainConstantsRD = useObservableState(thorchainConstantsState$, RD.pending)

  const [blocksLeft, setBlocksLeft] = useState('')

  useEffect(() => {
    const lastblock = RD.toNullable(thorchainLastblockRD)
    const constants = RD.toNullable(thorchainConstantsRD)
    if (lastblock && constants) {
      setBlocksLeft(getBlocksLeftForPendingPoolAsString(constants, lastblock))
    }
  }, [thorchainConstantsRD, thorchainLastblockRD])

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pools to render these while reloading
  const previousPools = useRef<Option<PoolTableRowsData>>(none)
  // store previous data of pending pools to render these while reloading
  const previousPendingPools = useRef<Option<PoolTableRowsData>>(none)

  const pendingCountdownHandler = useCallback(() => {
    reloadThorchainLastblock()
  }, [reloadThorchainLastblock])

  const pendingCountdownInterval = useMemo(() => {
    const pendingPools = RD.toNullable(pendingPoolsRD)
    // start countdown if we do have pending pools available only
    return pendingPools && pendingPools.poolDetails.length > 0 ? 5000 : INACTIVE_INTERVAL
  }, [pendingPoolsRD])

  useInterval(pendingCountdownHandler, pendingCountdownInterval)

  const selectedPricePool = useObservableState(selectedPricePool$, getDefaultRunePricePool())

  const getSwapPath = swapRoutes.swap.path
  const clickSwapHandler = useCallback(
    (p: SwapRouteParams) => {
      history.push(getSwapPath(p))
    },
    [getSwapPath, history]
  )

  const getDepositPath = depositRoutes.deposit.path

  const clickDepositHandler = useCallback(
    (asset: string) => {
      history.push(getDepositPath({ asset }))
    },
    [history, getDepositPath]
  )

  const clickRefreshHandler = useCallback(() => {
    reloadPools()
    reloadPendingPools()
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadPendingPools, reloadPools])

  const renderRefreshBtn = useMemo(
    () => (
      <Button onClick={clickRefreshHandler} typevalue="outline">
        <SyncOutlined />
        {intl.formatMessage({ id: 'common.refresh' })}
      </Button>
    ),
    [clickRefreshHandler, intl]
  )

  const renderBtnColTitle = useMemo(() => <ActionColumn>{renderRefreshBtn}</ActionColumn>, [renderRefreshBtn])

  const renderBtnPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => (
      <TableAction>
        <Button round="true" onClick={() => clickDepositHandler(assetToString(pool.target))} typevalue="outline">
          <PlusOutlined />
          {intl.formatMessage({ id: 'common.liquidity' })}
        </Button>
        <Button
          round="true"
          onClick={() => clickSwapHandler({ source: assetToString(pool.asset), target: assetToString(pool.target) })}>
          <SwapOutlined />
          {intl.formatMessage({ id: 'common.swap' })}
        </Button>
      </TableAction>
    ),

    [clickDepositHandler, clickSwapHandler, intl]
  )

  const btnPoolsColumn = useMemo(
    () => ({
      key: 'btn',
      title: renderBtnColTitle,
      width: 280,
      render: renderBtnPoolsColumn
    }),
    [renderBtnColTitle, renderBtnPoolsColumn]
  )

  const renderPoolColumn = useCallback(
    ({ pool }: PoolTableRowData) => (
      <Row justify="center" align="middle">
        <AssetIcon asset={pool.target} />
      </Row>
    ),
    []
  )
  const poolColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'pool',
      align: 'center',
      title: intl.formatMessage({ id: 'common.pool' }),
      width: 100,
      render: renderPoolColumn
    }),
    [renderPoolColumn, intl]
  )

  const renderPoolColumnMobile = useCallback(
    ({ pool }: PoolTableRowData) => (
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <AssetIcon asset={pool.target} />
      </Row>
    ),
    []
  )
  const poolColumnMobile: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'pool',
      title: intl.formatMessage({ id: 'common.pool' }),
      render: renderPoolColumnMobile
    }),
    [renderPoolColumnMobile, intl]
  )

  const renderAssetColumn = useCallback(
    ({ pool }: PoolTableRowData) => <Label align="center">{pool.target.ticker}</Label>,
    []
  )
  const sortAssetColumn = useCallback(
    ({ pool: poolA }: PoolTableRowData, { pool: poolB }: PoolTableRowData) =>
      poolA.target.symbol.localeCompare(poolB.target.symbol),
    []
  )
  const assetColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'asset',
      title: intl.formatMessage({ id: 'common.asset' }),
      render: renderAssetColumn,
      sorter: sortAssetColumn,
      sortDirections: ['descend', 'ascend'],
      defaultSortOrder: 'descend'
    }),
    [intl, sortAssetColumn, renderAssetColumn]
  )

  const renderPriceColumn = useCallback(
    ({ poolPrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(poolPrice),
          asset: selectedPricePool.asset,
          decimal: 3
        })}
      </Label>
    ),
    [selectedPricePool.asset]
  )
  const sortPriceColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.poolPrice, b.poolPrice),
    []
  )

  const priceColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'poolprice',
      align: 'right',
      title: intl.formatMessage({ id: 'common.price' }),
      render: renderPriceColumn,
      sorter: sortPriceColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [renderPriceColumn, sortPriceColumn, intl]
  )

  const renderDepthColumn = useCallback(
    ({ depthPrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(depthPrice),
          asset: selectedPricePool.asset,
          decimal: 2
        })}
      </Label>
    ),
    [selectedPricePool.asset]
  )

  const depthColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'depth',
      align: 'right',
      title: intl.formatMessage({ id: 'pools.depth' }),
      render: renderDepthColumn,
      sorter: sortByDepth,
      sortDirections: ['descend', 'ascend'],
      // Note: `defaultSortOrder` has no effect here, that's we do a default sort in `getPoolTableRowsData`
      defaultSortOrder: 'descend'
    }),
    [intl, renderDepthColumn]
  )

  const renderVolumeColumn = useCallback(
    ({ volumePrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(volumePrice),
          asset: selectedPricePool.asset,
          decimal: 2
        })}
      </Label>
    ),
    [selectedPricePool.asset]
  )
  const sortVolumeColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.volumePrice, b.volumePrice),
    []
  )
  const volumeColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'vol',
      align: 'right',
      title: intl.formatMessage({ id: 'pools.24hvol' }),
      render: renderVolumeColumn,
      sorter: sortVolumeColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderVolumeColumn, sortVolumeColumn]
  )

  const renderTransactionColumn = useCallback(
    ({ transactionPrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(transactionPrice),
          asset: selectedPricePool.asset,
          decimal: 2
        })}
      </Label>
    ),
    [selectedPricePool.asset]
  )
  const sortTransactionColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.transactionPrice, b.transactionPrice),
    []
  )
  const transactionColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'transaction',
      align: 'right',
      title: intl.formatMessage({ id: 'pools.avgsize' }),
      render: renderTransactionColumn,
      sorter: sortTransactionColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderTransactionColumn, sortTransactionColumn]
  )

  const renderSlipColumn = useCallback(({ slip }: PoolTableRowData) => <Trend amount={slip} />, [])
  const sortSlipColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBigNumber.compare(a.slip, b.slip),
    []
  )

  const slipColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'slip',
      align: 'center',
      title: intl.formatMessage({ id: 'pools.avgslip' }),
      render: renderSlipColumn,
      sorter: sortSlipColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderSlipColumn, sortSlipColumn]
  )

  const tradeColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'trade',
      align: 'center',
      title: intl.formatMessage({ id: 'pools.trades' }),
      render: ({ trades }: PoolTableRowData) => <Label align="center">{trades.toString()}</Label>,
      sorter: (a: PoolTableRowData, b: PoolTableRowData) => ordBigNumber.compare(a.trades, b.trades),
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const desktopPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      poolColumn,
      assetColumn,
      priceColumn,
      depthColumn,
      volumeColumn,
      transactionColumn,
      slipColumn,
      tradeColumn,
      btnPoolsColumn
    ],
    [
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
  )

  const mobilePoolsColumns: ColumnsType<PoolTableRowData> = useMemo(() => [poolColumnMobile, btnPoolsColumn], [
    poolColumnMobile,
    btnPoolsColumn
  ])

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
            return <ErrorView title={msg} extra={renderRefreshBtn} />
          },
          // success state
          ({ poolDetails }: PoolsState): JSX.Element => {
            const poolViewData = getPoolTableRowsData({
              poolDetails,
              pricePoolData: selectedPricePool.poolData,
              network
            })
            previousPools.current = some(poolViewData)
            return renderPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [network, poolsRD, renderPoolsTable, renderRefreshBtn, selectedPricePool.poolData]
  )

  const renderBtnPendingPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => (
      <TableAction>
        <Button round="true" onClick={() => clickDepositHandler(pool.target.symbol)} typevalue="outline">
          <PlusOutlined />
          liquidity
        </Button>
      </TableAction>
    ),
    [clickDepositHandler]
  )

  const btnPendingPoolsColumn = useMemo(
    () => ({
      key: 'btn',
      title: '',
      width: 200,
      render: renderBtnPendingPoolsColumn
    }),
    [renderBtnPendingPoolsColumn]
  )

  const renderBlockLeftColumn = useCallback(
    (_: string, record: PoolTableRowData) => {
      const { deepest } = record

      return (
        <TableAction>
          <BlockLeftLabel>{deepest ? blocksLeft.toString() : ''}</BlockLeftLabel>
        </TableAction>
      )
    },
    [blocksLeft]
  )

  const blockLeftColumn = useMemo(
    () => ({
      key: 'blocks',
      title: intl.formatMessage({ id: 'pools.blocksleft' }),
      width: 80,
      render: renderBlockLeftColumn
    }),
    [renderBlockLeftColumn, intl]
  )

  const desktopPendingPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [poolColumn, assetColumn, priceColumn, depthColumn, blockLeftColumn, btnPendingPoolsColumn],
    [poolColumn, assetColumn, priceColumn, depthColumn, blockLeftColumn, btnPendingPoolsColumn]
  )

  const mobilePendingPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [poolColumnMobile, btnPendingPoolsColumn],
    [poolColumnMobile, btnPendingPoolsColumn]
  )

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
          ({ poolDetails }: PendingPoolsState): JSX.Element => {
            const poolViewData = getPoolTableRowsData({
              poolDetails,
              pricePoolData: selectedPricePool.poolData,
              network
            })
            previousPendingPools.current = some(poolViewData)
            return renderPendingPoolsTable(poolViewData)
          }
        )(pendingPoolsRD)}
      </>
    ),
    [pendingPoolsRD, renderPendingPoolsTable, selectedPricePool.poolData, network]
  )

  return (
    <>
      <Label size="big" weight="bold" color="normal" textTransform="uppercase">
        {intl.formatMessage({ id: 'pools.available' })}
      </Label>
      {renderPools}
      <Label size="big" weight="bold" color="normal" textTransform="uppercase" style={{ marginTop: '40px' }}>
        {intl.formatMessage({ id: 'pools.pending' })}
      </Label>
      {renderPendingPools}
    </>
  )
}
