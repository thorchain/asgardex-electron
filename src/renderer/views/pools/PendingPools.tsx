import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetToString } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { ManageButton } from '../../components/manageButton'
import { FundsCap } from '../../components/pool'
import { Table } from '../../components/uielements/table'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { sequenceTRD } from '../../helpers/fpHelpers'
import { getPoolTableRowsData, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { useFundsCap } from '../../hooks/useFundsCap'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as poolsRoutes from '../../routes/pools'
import { DEFAULT_NETWORK } from '../../services/const'
import { PendingPoolsState, PoolFilter, ThorchainLastblockRD } from '../../services/midgard/types'
import { PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { getBlocksLeftForPendingPoolAsString } from './Pools.utils'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import { TableAction, BlockLeftLabel } from './PoolsOverview.style'
import * as Styled from './PoolsOverview.style'

const POOLS_KEY = 'pending'

export const PendingPools: React.FC = (): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()

  const {
    thorchainLastblockState$,
    thorchainConstantsState$,
    pools: { pendingPoolsState$, reloadPendingPools, selectedPricePool$, poolsFilters$, setPoolsFilter },
    reloadThorchainLastblock
  } = midgardService

  const poolsRD = useObservableState(pendingPoolsState$, RD.pending)
  const thorchainLastblockRD: ThorchainLastblockRD = useObservableState(thorchainLastblockState$, RD.pending)
  const thorchainConstantsRD = useObservableState(thorchainConstantsState$, RD.pending)

  const { reload: reloadFundsCap, data: fundsCapRD } = useFundsCap()

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pending pools to render these while reloading
  const previousPools = useRef<Option<PoolTableRowsData>>(none)

  const refreshHandler = useCallback(() => {
    reloadPendingPools()
    reloadFundsCap()
  }, [reloadFundsCap, reloadPendingPools])

  const pendingCountdownHandler = useCallback(() => {
    reloadThorchainLastblock()
  }, [reloadThorchainLastblock])

  const pendingCountdownInterval = useMemo(() => {
    const pendingPools = RD.toNullable(poolsRD)
    // start countdown if we do have pending pools available only
    return pendingPools && pendingPools.poolDetails.length > 0 ? 5000 : INACTIVE_INTERVAL
  }, [poolsRD])

  useInterval(pendingCountdownHandler, pendingCountdownInterval)

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const renderBtnPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => (
      <TableAction>
        <ManageButton asset={pool.target} isTextView={isDesktopView} />
      </TableAction>
    ),
    [isDesktopView]
  )

  const btnPendingPoolsColumn = useMemo(
    () => ({
      key: 'btn',
      title: Shared.renderRefreshBtnColTitle(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
      width: 200,
      render: renderBtnPoolsColumn
    }),
    [refreshHandler, intl, renderBtnPoolsColumn]
  )

  const [poolFilter] = useObservableState<O.Option<PoolFilter>>(
    () =>
      FP.pipe(
        poolsFilters$,
        RxOp.map((filters) => FP.pipe(O.fromNullable(filters[POOLS_KEY]), O.flatten))
      ),
    O.none
  )

  const setFilter = useCallback((oFilter: O.Option<PoolFilter>) => setPoolsFilter(POOLS_KEY, oFilter), [setPoolsFilter])

  const renderBlockLeftColumn = useCallback(
    (_: string, record: PoolTableRowData) => {
      const { deepest, pool } = record

      const blocksLeft: string = FP.pipe(
        sequenceTRD(thorchainLastblockRD, thorchainConstantsRD),
        RD.map(([lastblockItems, constants]) =>
          getBlocksLeftForPendingPoolAsString(constants, lastblockItems, pool.target)
        ),
        RD.getOrElse(() => '--')
      )

      return (
        <TableAction>
          <BlockLeftLabel>{deepest ? blocksLeft : '--'}</BlockLeftLabel>
        </TableAction>
      )
    },
    [thorchainLastblockRD, thorchainConstantsRD]
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

  const desktopPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      Shared.priceColumn(intl.formatMessage({ id: 'common.price' }), selectedPricePool.asset),
      Shared.depthColumn(intl.formatMessage({ id: 'pools.depth' }), selectedPricePool.asset),
      blockLeftColumn,
      btnPendingPoolsColumn
    ],
    [intl, selectedPricePool.asset, blockLeftColumn, btnPendingPoolsColumn]
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
      return (
        <>
          <Styled.AssetsFilter
            setFilter={setFilter}
            activeFilter={poolFilter}
            assets={FP.pipe(
              tableData,
              A.map(({ pool }) => pool.target)
            )}
          />
          <FundsCap fundsCap={fundsCapRD} />
          <Table
            columns={columns}
            dataSource={FP.pipe(tableData, filterTableData(poolFilter))}
            loading={loading}
            rowKey="key"
            onRow={({ pool }: PoolTableRowData) => {
              return {
                onClick: () => {
                  history.push(poolsRoutes.detail.path({ asset: assetToString(pool.target) }))
                }
              }
            }}
          />
        </>
      )
    },
    [isDesktopView, desktopPoolsColumns, mobilePoolsColumns, setFilter, poolFilter, fundsCapRD, history]
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
  )
}
