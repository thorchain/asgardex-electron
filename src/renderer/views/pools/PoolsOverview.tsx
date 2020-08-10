import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'

import { SyncOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { assetToString, BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Grid, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import BigNumber from 'bignumber.js'
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
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getPoolTableRowsData, hasPendingPools } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { SwapRouteParams } from '../../routes/swap'
import { PoolsState } from '../../services/midgard/types'
import { pricePoolSelectorFromRD } from '../../services/midgard/utils'
import { PoolDetailStatusEnum } from '../../types/generated/midgard'
import { ActionColumn, TableAction, BlockLeftLabel } from './PoolsOverview.style'
import { PoolTableRowData, PoolTableRowsData, PricePoolAsset, PoolAsset, Pool } from './types'
import { getBlocksLeftForPendingPoolAsString } from './utils'

type Props = {}

const PoolsOverview: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { service: midgardService } = useMidgardContext()
  const poolsRD = useObservableState(midgardService.poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<Option<PricePoolAsset>>(
    midgardService.selectedPricePoolAsset$,
    // FIXME(@Veado) Depends on main/testnet - https://github.com/thorchain/asgardex-electron/issues/316
    some(PoolAsset.RUNE67C)
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
    midgardService.reloadPoolsState()
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
    (_: string, record: PoolTableRowData) => {
      const {
        pool: { asset, target }
      } = record

      const { symbol: targetSymbol = '' } = target
      return (
        <TableAction>
          <Button round="true" onClick={() => clickStakeHandler(targetSymbol)} typevalue="outline">
            <PlusOutlined />
            liquidity
          </Button>
          <Button
            round="true"
            onClick={() => clickSwapHandler({ source: assetToString(asset), target: assetToString(target) })}>
            <SwapOutlined />
            swap
          </Button>
        </TableAction>
      )
    },
    [clickStakeHandler, clickSwapHandler]
  )

  const btnPoolsColumn = {
    key: 'btn',
    title: renderBtnColTitle,
    width: 280,
    render: renderBtnPoolsColumn
  }

  const renderPoolColumn = useCallback(
    ({ target }: Pool) => (
      <Row justify="center" align="middle">
        <AssetIcon asset={target} />
      </Row>
    ),
    []
  )
  const poolColumn: ColumnType<PoolTableRowData> = {
    key: 'pool',
    title: 'pool',
    dataIndex: 'pool',
    width: 100,
    render: renderPoolColumn
  }

  const renderPoolColumnMobile = useCallback(
    ({ target }: Pool) => (
      <Row justify="center" align="middle" style={{ width: '100%' }}>
        <AssetIcon asset={target} />
      </Row>
    ),
    []
  )
  const poolColumnMobile: ColumnType<PoolTableRowData> = {
    key: 'pool',
    title: 'pool',
    dataIndex: 'pool',
    render: renderPoolColumnMobile
  }

  const renderAssetColumn = useCallback(({ target }: Pool) => <Label>{target?.ticker ?? 'unknown'}</Label>, [])
  const sortAssetColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => {
    const { symbol: aSymbol = '' } = a.pool.target
    const { symbol: bSymbol = '' } = b.pool.target
    return aSymbol.localeCompare(bSymbol)
  }, [])
  const assetColumn: ColumnType<PoolTableRowData> = {
    key: 'asset',
    title: 'asset',
    dataIndex: 'pool',
    render: renderAssetColumn,
    sorter: sortAssetColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderPriceColumn = useCallback(
    (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset, 3)}</Label>,
    [pricePool]
  )
  const sortPriceColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => {
    const aAmount = a.poolPrice.amount()
    const bAmount = b.poolPrice.amount()
    return aAmount.minus(bAmount).toNumber()
  }, [])

  const priceColumn: ColumnType<PoolTableRowData> = {
    key: 'poolprice',
    title: 'price',
    dataIndex: 'poolPrice',
    render: renderPriceColumn,
    sorter: sortPriceColumn,
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend'
  }

  const renderDepthColumn = useCallback(
    (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset)}</Label>,
    [pricePool]
  )
  const sortDepthColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => {
    const aAmount = a.depthPrice.amount()
    const bAmount = b.depthPrice.amount()
    return aAmount.minus(bAmount).toNumber()
  }, [])
  const depthColumn: ColumnType<PoolTableRowData> = {
    key: 'depth',
    title: 'depth',
    dataIndex: 'depthPrice',
    render: renderDepthColumn,
    sorter: sortDepthColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderVolumeColumn = useCallback(
    (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset)}</Label>,
    [pricePool]
  )
  const sortVolumeColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => {
    const aAmount = a.volumePrice.amount()
    const bAmount = b.volumePrice.amount()
    return aAmount.minus(bAmount).toNumber()
  }, [])
  const volumeColumn: ColumnType<PoolTableRowData> = {
    key: 'vol',
    title: '24h vol',
    dataIndex: 'volumePrice',
    render: renderVolumeColumn,
    sorter: sortVolumeColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderTransactionColumn = useCallback(
    (price: BaseAmount) => <Label>{formatAssetAmountCurrency(baseToAsset(price), pricePool.asset)}</Label>,
    [pricePool]
  )
  const sortTransactionColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => {
    const aAmount = a.transactionPrice.amount()
    const bAmount = b.transactionPrice.amount()
    return aAmount.minus(bAmount).toNumber()
  }, [])
  const transactionColumn: ColumnType<PoolTableRowData> = {
    key: 'transaction',
    title: 'avg. size',
    dataIndex: 'transactionPrice',
    render: renderTransactionColumn,
    sorter: sortTransactionColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderSlipColumn = useCallback((slip: BigNumber) => <Trend amount={slip} />, [])
  const sortSlipColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => a.slip.minus(b.slip).toNumber(), [])

  const slipColumn: ColumnType<PoolTableRowData> = {
    key: 'slip',
    title: 'avg. slip',
    dataIndex: 'slip',
    render: renderSlipColumn,
    sorter: sortSlipColumn,
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
            return <ErrorView message={msg} actionButton={renderRefreshBtn} />
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
    [poolsRD, pricePool.poolData, renderPoolsTable, renderRefreshBtn]
  )

  const renderBtnPendingPoolsColumn = useCallback(
    (_: string, record: PoolTableRowData) => {
      const {
        pool: { target }
      } = record

      return (
        <TableAction>
          <Button round="true" onClick={() => clickStakeHandler(target.symbol)} typevalue="outline">
            <PlusOutlined />
            liquidity
          </Button>
        </TableAction>
      )
    },
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
    title: 'blocks left',
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
    <>
      <Label size="big" weight="bold" color="normal" textTransform="uppercase">
        Available Pools
      </Label>
      {renderPools}
      <Label size="big" weight="bold" color="normal" textTransform="uppercase" style={{ marginTop: '40px' }}>
        Pending Pools
      </Label>
      {renderPendingPools}
    </>
  )
}

export default PoolsOverview
