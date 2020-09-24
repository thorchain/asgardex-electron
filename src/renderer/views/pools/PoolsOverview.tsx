import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { assetToString, baseToAsset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Grid, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import ErrorView from '../../components/shared/error/ErrorView'
import AssetIcon from '../../components/uielements/assets/assetIcon'
import Button from '../../components/uielements/button'
import Label from '../../components/uielements/label'
import Table from '../../components/uielements/table'
import Trend from '../../components/uielements/trend'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { ordBaseAmount, ordBigNumber } from '../../helpers/fp/ord'
import { getPoolTableRowsData, hasPendingPools, sortByDepth } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { Network } from '../../services/app/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolsState } from '../../services/midgard/types'
import { pricePoolSelectorFromRD } from '../../services/midgard/utils'
import { PoolDetailStatusEnum } from '../../types/generated/midgard'
import { ActionColumn, TableAction, BlockLeftLabel } from './PoolsOverview.style'
import { PoolTableRowData, PoolTableRowsData, PricePoolAsset } from './types'
import { getBlocksLeftForPendingPoolAsString } from './utils'

type Props = {}

const PoolsOverview: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)
  const { service: midgardService } = useMidgardContext()
  const poolsRD = useObservableState(midgardService.pools.poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<Option<PricePoolAsset>>(
    midgardService.pools.selectedPricePoolAsset$,
    some(midgardService.pools.getDefaultRuneAsset() as PricePoolAsset)
  )
  const thorchainLastblockRD = useObservableState(midgardService.thorchainLastblockState$, RD.pending)
  const thorchainConstantsRD = useObservableState(midgardService.thorchainConstantsState$, RD.pending)

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
    midgardService.reloadThorchainLastblock()
  }, [midgardService])

  const pendingCountdownInterval = useMemo(() => {
    const pools = RD.toNullable(poolsRD)
    // start countdown if we do have pending pools available only
    return pools && hasPendingPools(pools.poolDetails) ? 5000 : INACTIVE_INTERVAL
  }, [poolsRD])

  useInterval(pendingCountdownHandler, pendingCountdownInterval)

  const pricePool = useMemo(() => pricePoolSelectorFromRD(poolsRD, selectedPricePoolAsset), [
    poolsRD,
    selectedPricePoolAsset
  ])
  const getSwapPath = swapRoutes.swap.path
  const clickSwapHandler = useCallback(
    (p: SwapRouteParams) => {
      history.push(getSwapPath(p))
    },
    [getSwapPath, history]
  )

  const getStakePath = stakeRoutes.stake.path

  const clickStakeHandler = useCallback(
    (asset: string) => {
      history.push(getStakePath({ asset }))
    },
    [history, getStakePath]
  )

  const clickRefreshHandler = useCallback(() => {
    midgardService.pools.reloadPoolsState()
    midgardService.reloadNetworkInfo()
  }, [midgardService])

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
        <Button round="true" onClick={() => clickStakeHandler(assetToString(pool.target))} typevalue="outline">
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

    [clickStakeHandler, clickSwapHandler, intl]
  )

  const btnPoolsColumn = {
    key: 'btn',
    title: renderBtnColTitle,
    width: 280,
    render: renderBtnPoolsColumn
  }

  const renderPoolColumn = useCallback(
    ({ pool }: PoolTableRowData) => (
      <Row justify="center" align="middle">
        <AssetIcon asset={pool.target} />
      </Row>
    ),
    []
  )
  const poolColumn: ColumnType<PoolTableRowData> = {
    key: 'pool',
    align: 'center',
    title: intl.formatMessage({ id: 'common.pool' }),
    width: 100,
    render: renderPoolColumn
  }

  const renderPoolColumnMobile = useCallback(
    ({ pool }: PoolTableRowData) => (
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <AssetIcon asset={pool.target} />
      </Row>
    ),
    []
  )
  const poolColumnMobile: ColumnType<PoolTableRowData> = {
    key: 'pool',
    title: intl.formatMessage({ id: 'common.pool' }),
    render: renderPoolColumnMobile
  }

  const renderAssetColumn = useCallback(
    ({ pool }: PoolTableRowData) => <Label align="center">{pool.target.ticker}</Label>,
    []
  )
  const sortAssetColumn = useCallback(
    ({ pool: poolA }: PoolTableRowData, { pool: poolB }: PoolTableRowData) =>
      poolA.target.symbol.localeCompare(poolB.target.symbol),
    []
  )
  const assetColumn: ColumnType<PoolTableRowData> = {
    key: 'asset',
    title: intl.formatMessage({ id: 'common.asset' }),
    render: renderAssetColumn,
    sorter: sortAssetColumn,
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend'
  }

  const renderPriceColumn = useCallback(
    ({ poolPrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency(baseToAsset(poolPrice), pricePool.asset, 3)}
      </Label>
    ),
    [pricePool]
  )
  const sortPriceColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.poolPrice, b.poolPrice),
    []
  )

  const priceColumn: ColumnType<PoolTableRowData> = {
    key: 'poolprice',
    align: 'right',
    title: intl.formatMessage({ id: 'common.price' }),
    render: renderPriceColumn,
    sorter: sortPriceColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderDepthColumn = useCallback(
    ({ depthPrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency(baseToAsset(depthPrice), pricePool.asset)}
      </Label>
    ),
    [pricePool]
  )

  const depthColumn: ColumnType<PoolTableRowData> = {
    key: 'depth',
    align: 'right',
    title: intl.formatMessage({ id: 'pools.depth' }),
    render: renderDepthColumn,
    sorter: sortByDepth,
    sortDirections: ['descend', 'ascend'],
    // Note: `defaultSortOrder` has no effect here, that's we do a default sort in `getPoolTableRowsData`
    defaultSortOrder: 'descend'
  }

  const renderVolumeColumn = useCallback(
    ({ volumePrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency(baseToAsset(volumePrice), pricePool.asset)}
      </Label>
    ),
    [pricePool]
  )
  const sortVolumeColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.volumePrice, b.volumePrice),
    []
  )
  const volumeColumn: ColumnType<PoolTableRowData> = {
    key: 'vol',
    align: 'right',
    title: intl.formatMessage({ id: 'pools.24hvol' }),
    render: renderVolumeColumn,
    sorter: sortVolumeColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderTransactionColumn = useCallback(
    ({ transactionPrice }: PoolTableRowData) => (
      <Label align="right" nowrap>
        {formatAssetAmountCurrency(baseToAsset(transactionPrice), pricePool.asset)}
      </Label>
    ),
    [pricePool]
  )
  const sortTransactionColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBaseAmount.compare(a.transactionPrice, b.transactionPrice),
    []
  )
  const transactionColumn: ColumnType<PoolTableRowData> = {
    key: 'transaction',
    align: 'right',
    title: intl.formatMessage({ id: 'pools.avgsize' }),
    render: renderTransactionColumn,
    sorter: sortTransactionColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderSlipColumn = useCallback(({ slip }: PoolTableRowData) => <Trend amount={slip} />, [])
  const sortSlipColumn = useCallback(
    (a: PoolTableRowData, b: PoolTableRowData) => ordBigNumber.compare(a.slip, b.slip),
    []
  )

  const slipColumn: ColumnType<PoolTableRowData> = {
    key: 'slip',
    align: 'center',
    title: intl.formatMessage({ id: 'pools.avgslip' }),
    render: renderSlipColumn,
    sorter: sortSlipColumn,
    sortDirections: ['descend', 'ascend']
  }

  const tradeColumn: ColumnType<PoolTableRowData> = {
    key: 'trade',
    align: 'center',
    title: intl.formatMessage({ id: 'pools.trades' }),
    render: ({ trades }: PoolTableRowData) => <Label align="center">{trades.toString()}</Label>,
    sorter: (a: PoolTableRowData, b: PoolTableRowData) => ordBigNumber.compare(a.trades, b.trades),
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
            return <ErrorView title={msg} extra={renderRefreshBtn} />
          },
          // success state
          (pools: PoolsState): JSX.Element => {
            const poolViewData = getPoolTableRowsData({
              poolDetails: pools.poolDetails,
              pricePoolData: pricePool.poolData,
              poolStatus: PoolDetailStatusEnum.Enabled,
              network
            })
            previousPools.current = some(poolViewData)
            return renderPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [network, poolsRD, pricePool.poolData, renderPoolsTable, renderRefreshBtn]
  )

  const renderBtnPendingPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => (
      <TableAction>
        <Button round="true" onClick={() => clickStakeHandler(pool.target.symbol)} typevalue="outline">
          <PlusOutlined />
          liquidity
        </Button>
      </TableAction>
    ),
    [clickStakeHandler]
  )

  const btnPendingPoolsColumn = {
    key: 'btn',
    title: '',
    width: 200,
    render: renderBtnPendingPoolsColumn
  }

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

  const blockLeftColumn = {
    key: 'blocks',
    title: intl.formatMessage({ id: 'pools.blocksleft' }),
    width: 80,
    render: renderBlockLeftColumn
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
            const poolViewData = getPoolTableRowsData({
              poolDetails: state.poolDetails,
              pricePoolData: pricePool.poolData,
              poolStatus: PoolDetailStatusEnum.Bootstrapped,
              network
            })
            previousPendingPools.current = some(poolViewData)
            return renderPendingPoolsTable(poolViewData)
          }
        )(poolsRD)}
      </>
    ),
    [poolsRD, renderPendingPoolsTable, pricePool.poolData, network]
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

export default PoolsOverview
