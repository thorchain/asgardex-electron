import React, { useCallback, useMemo, useRef } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { assetToString, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { ErrorView } from '../../components/shared/error'
import { Button } from '../../components/uielements/button'
import { Label } from '../../components/uielements/label'
import { Table } from '../../components/uielements/table'
import { Trend } from '../../components/uielements/trend'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { ordBaseAmount, ordBigNumber } from '../../helpers/fp/ord'
import { getPoolTableRowsData, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as depositRoutes from '../../routes/deposit'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { PoolsState } from '../../services/midgard/types'
import { PoolTableRowData, PoolTableRowsData } from './Pools.types'
import * as Shared from './PoolsOverview.shared'
import { ActionColumn, TableAction } from './PoolsOverview.style'

export const ActivePools: React.FC = (): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, pendingPoolsState$, selectedPricePool$, reloadPools },
    reloadThorchainLastblock,
    reloadNetworkInfo
  } = midgardService
  const poolsRD = useObservableState(poolsState$, RD.pending)
  const pendingPoolsRD = useObservableState(pendingPoolsState$, RD.pending)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pools to render these while reloading
  const previousPools = useRef<Option<PoolTableRowsData>>(none)

  const pendingCountdownHandler = useCallback(() => {
    reloadThorchainLastblock()
  }, [reloadThorchainLastblock])

  const pendingCountdownInterval = useMemo(() => {
    const pendingPools = RD.toNullable(pendingPoolsRD)
    // start countdown if we do have pending pools available only
    return pendingPools && pendingPools.poolDetails.length > 0 ? 5000 : INACTIVE_INTERVAL
  }, [pendingPoolsRD])

  useInterval(pendingCountdownHandler, pendingCountdownInterval)

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

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
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadPools])

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
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      Shared.priceColumn(intl.formatMessage({ id: 'common.price' })),
      Shared.depthColumn(intl.formatMessage({ id: 'pools.depth' }), selectedPricePool.asset),
      volumeColumn,
      transactionColumn,
      slipColumn,
      tradeColumn,
      btnPoolsColumn
    ],
    [intl, selectedPricePool.asset, volumeColumn, transactionColumn, slipColumn, tradeColumn, btnPoolsColumn]
  )

  const mobilePoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [Shared.poolColumnMobile(intl.formatMessage({ id: 'common.pool' })), btnPoolsColumn],
    [btnPoolsColumn, intl]
  )

  const renderPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
      const columns = isDesktopView ? desktopPoolsColumns : mobilePoolsColumns
      return <Table columns={columns} dataSource={tableData} loading={loading} rowKey="key" />
    },
    [isDesktopView, desktopPoolsColumns, mobilePoolsColumns]
  )

  return (
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
            pricePoolData: selectedPricePool.poolData
          })
          previousPools.current = some(poolViewData)
          return renderPoolsTable(poolViewData)
        }
      )(poolsRD)}
    </>
  )
}
