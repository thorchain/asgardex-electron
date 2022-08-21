import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetToString } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts/lib/Predicate'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { ManageButton } from '../../components/manageButton'
import { ProtocolLimit, IncentivePendulum } from '../../components/pool'
import { Table } from '../../components/uielements/table'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import * as PoolHelpers from '../../helpers/poolHelper'
import { getPoolTableRowsData, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { useIncentivePendulum } from '../../hooks/useIncentivePendulum'
import { usePoolCycle } from '../../hooks/usePoolCycle'
import { usePoolFilter } from '../../hooks/usePoolFilter'
import { usePoolWatchlist } from '../../hooks/usePoolWatchlist'
import { useProtocolLimit } from '../../hooks/useProtocolLimit'
import * as poolsRoutes from '../../routes/pools'
import { DEFAULT_NETWORK } from '../../services/const'
import { PendingPoolsState, DEFAULT_POOL_FILTERS, ThorchainLastblockRD } from '../../services/midgard/types'
import { PoolDetail } from '../../types/generated/midgard'
import { PoolsComponentProps, PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { getBlocksLeftForPendingPoolAsString, isEmptyPool } from './Pools.utils'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import { TableAction, BlockLeftLabel } from './PoolsOverview.styles'
import * as Styled from './PoolsOverview.styles'

export const PendingPools: React.FC<PoolsComponentProps> = ({ haltedChains, mimirHalt, walletLocked }): JSX.Element => {
  const navigate = useNavigate()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const {
    service: {
      thorchainLastblockState$,
      pools: { pendingPoolsState$, reloadPendingPools, selectedPricePool$ }
    }
  } = useMidgardContext()

  const { setFilter: setPoolFilter, filter: poolFilter } = usePoolFilter('pending')
  const { add: addPoolToWatchlist, remove: removePoolFromWatchlist, list: poolWatchList } = usePoolWatchlist()

  const poolsRD = useObservableState(pendingPoolsState$, RD.pending)
  const thorchainLastblockRD: ThorchainLastblockRD = useObservableState(thorchainLastblockState$, RD.pending)

  const { reload: reloadLimit, data: limitRD } = useProtocolLimit()
  const { data: incentivePendulumRD } = useIncentivePendulum()

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pending pools to render these while reloading
  const previousPools = useRef<O.Option<PoolTableRowsData>>(O.none)

  const { poolCycle, reloadPoolCycle } = usePoolCycle()

  const oNewPoolCycle = useMemo(() => FP.pipe(poolCycle, RD.toOption), [poolCycle])

  const refreshHandler = useCallback(() => {
    reloadPendingPools()
    reloadLimit()
    reloadPoolCycle()
  }, [reloadLimit, reloadPendingPools, reloadPoolCycle])

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const renderBtnPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => {
      const disablePool =
        PoolHelpers.disableAllActions({ chain: pool.target.chain, haltedChains, mimirHalt }) ||
        PoolHelpers.disablePoolActions({ chain: pool.target.chain, haltedChains, mimirHalt })
      return (
        <TableAction>
          <ManageButton asset={pool.target} isTextView={isDesktopView} disabled={disablePool || walletLocked} />
        </TableAction>
      )
    },
    [haltedChains, isDesktopView, mimirHalt, walletLocked]
  )

  const btnPendingPoolsColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'btn',
      title: Shared.renderRefreshBtnColTitle({
        title: intl.formatMessage({ id: 'common.refresh' }),
        clickHandler: refreshHandler,
        iconOnly: !isDesktopView
      }),
      width: 200,
      render: renderBtnPoolsColumn
    }),
    [intl, refreshHandler, isDesktopView, renderBtnPoolsColumn]
  )

  const renderBlockLeftColumn = useCallback(
    (_: string, record: PoolTableRowData) => {
      const { deepest, pool } = record

      const blocksLeft: string = FP.pipe(
        thorchainLastblockRD,
        RD.map((lastblockItems) => getBlocksLeftForPendingPoolAsString(lastblockItems, pool.target, oNewPoolCycle)),
        RD.getOrElse(() => '--')
      )

      return (
        <TableAction>
          <BlockLeftLabel>{deepest ? blocksLeft : '--'}</BlockLeftLabel>
        </TableAction>
      )
    },
    [thorchainLastblockRD, oNewPoolCycle]
  )

  const blockLeftColumn: ColumnType<PoolTableRowData> = useMemo(
    () => ({
      key: 'blocks',
      title: intl.formatMessage({ id: 'pools.blocksleft' }),
      align: 'right',
      width: 80,
      render: renderBlockLeftColumn
    }),
    [renderBlockLeftColumn, intl]
  )

  const desktopPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.watchColumn(addPoolToWatchlist, removePoolFromWatchlist),
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      Shared.priceColumn(intl.formatMessage({ id: 'common.price' }), selectedPricePool.asset),
      Shared.depthColumn(intl.formatMessage({ id: 'common.liquidity' }), selectedPricePool.asset),
      blockLeftColumn,
      btnPendingPoolsColumn
    ],
    [addPoolToWatchlist, removePoolFromWatchlist, intl, selectedPricePool.asset, blockLeftColumn, btnPendingPoolsColumn]
  )

  const mobilePoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.poolColumnMobile(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      btnPendingPoolsColumn
    ],
    [btnPendingPoolsColumn, intl]
  )

  const renderPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
      const columns = isDesktopView ? desktopPoolsColumns : mobilePoolsColumns
      const dataSource = FP.pipe(tableData, filterTableData(poolFilter))

      return (
        <>
          <Styled.AssetsFilter setFilter={setPoolFilter} activeFilter={poolFilter} poolFilters={DEFAULT_POOL_FILTERS} />
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
        ({ poolDetails }: PendingPoolsState): JSX.Element => {
          // filter out empty pools
          const poolDetailsFiltered = A.filter<PoolDetail>(P.not(isEmptyPool))(poolDetails)
          const poolViewData = getPoolTableRowsData({
            poolDetails: poolDetailsFiltered,
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
