import React, { useCallback, useMemo, useRef } from 'react'

import { SwapOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { assetToString, baseToAsset, bn, formatAssetAmountCurrency, formatBN } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { ManageButton } from '../../components/manageButton'
import { ProtocolLimit, IncentivePendulum } from '../../components/pool'
import { Button } from '../../components/uielements/button'
import { Table } from '../../components/uielements/table'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { ordBaseAmount, ordNumber } from '../../helpers/fp/ord'
import * as PoolHelpers from '../../helpers/poolHelper'
import { useIncentivePendulum } from '../../hooks/useIncentivePendulum'
import { usePoolFilter } from '../../hooks/usePoolFilter'
import { usePoolWatchlist } from '../../hooks/usePoolWatchlist'
import { useProtocolLimit } from '../../hooks/useProtocolLimit'
import * as poolsRoutes from '../../routes/pools'
import { SwapRouteParams } from '../../routes/pools/swap'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolsState, DEFAULT_POOL_FILTERS } from '../../services/midgard/types'
import { PoolsComponentProps, PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import * as Styled from './PoolsOverview.styles'

export const ActivePools: React.FC<PoolsComponentProps> = ({ haltedChains, mimirHalt, walletLocked }): JSX.Element => {
  const navigate = useNavigate()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const {
    service: {
      pools: { poolsState$, reloadPools, selectedPricePool$ }
    }
  } = useMidgardContext()
  const { reload: reloadLimit, data: limitRD } = useProtocolLimit()
  const { data: incentivePendulumRD } = useIncentivePendulum()

  const { setFilter: setPoolFilter, filter: poolFilter } = usePoolFilter('active')
  const { add: addPoolToWatchlist, remove: removePoolFromWatchlist, list: poolWatchList } = usePoolWatchlist()

  const poolsRD = useObservableState(poolsState$, RD.pending)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const isLargeScreen = Grid.useBreakpoint()?.xl ?? false

  // store previous data of pools to render these while reloading
  const previousPools = useRef<O.Option<PoolTableRowsData>>(O.none)

  const refreshHandler = useCallback(() => {
    reloadPools()
    reloadLimit()
  }, [reloadPools, reloadLimit])

  const selectedPricePool = useObservableState(selectedPricePool$, PoolHelpers.RUNE_PRICE_POOL)

  const clickSwapHandler = useCallback(
    (p: SwapRouteParams) => {
      navigate(poolsRoutes.swap.path(p))
    },
    [navigate]
  )

  const renderBtnPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => {
      const chain = pool.target.chain
      const disableAllPoolActions = PoolHelpers.disableAllActions({ chain, haltedChains, mimirHalt })
      const disableTradingActions = PoolHelpers.disableTradingActions({
        chain,
        haltedChains,
        mimirHalt
      })
      const disablePoolActions = PoolHelpers.disablePoolActions({
        chain,
        haltedChains,
        mimirHalt
      })

      return (
        <Styled.TableAction>
          <ManageButton
            disabled={disableAllPoolActions || disablePoolActions || walletLocked}
            asset={pool.target}
            sizevalue={isDesktopView ? 'normal' : 'small'}
            isTextView={isDesktopView}
          />
          <Button
            round="true"
            sizevalue={isDesktopView ? 'normal' : 'small'}
            disabled={disableAllPoolActions || disableTradingActions}
            style={{ height: 30 }}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              clickSwapHandler({
                source: assetToString(pool.asset),
                target: assetToString(pool.target)
              })
            }}>
            <SwapOutlined />
            {isDesktopView && intl.formatMessage({ id: 'common.swap' })}
          </Button>
        </Styled.TableAction>
      )
    },

    [haltedChains, mimirHalt, walletLocked, isDesktopView, intl, clickSwapHandler]
  )

  const btnPoolsColumn = useMemo(
    () => ({
      key: 'btn',
      title: Shared.renderRefreshBtnColTitle(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
      width: 280,
      render: renderBtnPoolsColumn
    }),
    [refreshHandler, intl, renderBtnPoolsColumn]
  )

  const renderVolumeColumn = useCallback(
    ({ volumePrice }: PoolTableRowData) => (
      <Styled.Label align="right" nowrap>
        {formatAssetAmountCurrency({
          amount: baseToAsset(volumePrice),
          asset: selectedPricePool.asset,
          decimal: 2
        })}
      </Styled.Label>
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

  const renderAPYColumn = useCallback(
    ({ apy }: PoolTableRowData) => (
      <Styled.Label align="right" nowrap>
        {formatBN(bn(apy), 2)}%
      </Styled.Label>
    ),
    []
  )

  const sortAPYColumn = useCallback((a: PoolTableRowData, b: PoolTableRowData) => ordNumber.compare(a.apy, b.apy), [])
  const apyColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'apy',
      align: 'right',
      title: intl.formatMessage({ id: 'pools.apy' }),
      render: renderAPYColumn,
      sorter: sortAPYColumn,
      sortDirections: ['descend', 'ascend']
    }),
    [intl, renderAPYColumn, sortAPYColumn]
  )

  const desktopPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () =>
      FP.pipe(
        [
          O.some(Shared.watchColumn(addPoolToWatchlist, removePoolFromWatchlist)),
          O.some(Shared.poolColumn(intl.formatMessage({ id: 'common.pool' }))),
          O.some(Shared.assetColumn(intl.formatMessage({ id: 'common.asset' }))),
          O.some(Shared.priceColumn(intl.formatMessage({ id: 'common.price' }), selectedPricePool.asset)),
          O.some(Shared.depthColumn(intl.formatMessage({ id: 'common.liquidity' }), selectedPricePool.asset)),
          O.some(volumeColumn),
          isLargeScreen ? O.some(apyColumn) : O.none,
          O.some(btnPoolsColumn)
        ],
        A.filterMap(FP.identity)
      ),
    [
      addPoolToWatchlist,
      removePoolFromWatchlist,
      intl,
      selectedPricePool.asset,
      volumeColumn,
      isLargeScreen,
      apyColumn,
      btnPoolsColumn
    ]
  )

  const mobilePoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.poolColumnMobile(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      btnPoolsColumn
    ],
    [btnPoolsColumn, intl]
  )

  const renderPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
      const columns = isDesktopView ? desktopPoolsColumns : mobilePoolsColumns
      const dataSource = FP.pipe(tableData, filterTableData(poolFilter))

      return (
        <>
          <Styled.AssetsFilter activeFilter={poolFilter} setFilter={setPoolFilter} poolFilters={DEFAULT_POOL_FILTERS} />
          <ProtocolLimit limit={limitRD} />
          <IncentivePendulum incentivePendulum={incentivePendulumRD} />
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            rowKey="key"
            onRow={({ pool }: PoolTableRowData) => {
              return {
                onClick: () => {
                  navigate(poolsRoutes.detail.path({ asset: assetToString(pool.target) }))
                }
              }
            }}
          />
        </>
      )
    },
    [
      isDesktopView,
      desktopPoolsColumns,
      mobilePoolsColumns,
      poolFilter,
      setPoolFilter,
      limitRD,
      incentivePendulumRD,
      navigate
    ]
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
        // render error state
        Shared.renderTableError(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
        // success state
        ({ poolDetails }: PoolsState): JSX.Element => {
          const poolViewData = PoolHelpers.getPoolTableRowsData({
            poolDetails,
            pricePoolData: selectedPricePool.poolData,
            watchlist: poolWatchList,
            network
          })
          previousPools.current = O.some(poolViewData)
          return renderPoolsTable(poolViewData)
        }
      )(poolsRD)}
    </>
  )
}
