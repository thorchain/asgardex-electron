import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetToString } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as P from 'fp-ts/lib/Predicate'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

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
import { useProtocolLimit } from '../../hooks/useProtocolLimit'
import * as poolsRoutes from '../../routes/pools'
import { DEFAULT_NETWORK } from '../../services/const'
import { PendingPoolsState, PoolFilter, ThorchainLastblockRD } from '../../services/midgard/types'
import { PoolDetail } from '../../types/generated/midgard'
import { PoolsComponentProps, PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { getBlocksLeftForPendingPoolAsString, isEmptyPool } from './Pools.utils'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import { TableAction, BlockLeftLabel } from './PoolsOverview.styles'
import * as Styled from './PoolsOverview.styles'

const POOLS_KEY = 'pending'

export const PendingPools: React.FC<PoolsComponentProps> = ({ haltedChains, mimirHalt, walletLocked }): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()

  const {
    thorchainLastblockState$,
    pools: { pendingPoolsState$, reloadPendingPools, selectedPricePool$, poolsFilters$, setPoolsFilter }
  } = midgardService

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
      Shared.depthColumn(intl.formatMessage({ id: 'common.liquidity' }), selectedPricePool.asset),
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
          <ProtocolLimit limit={limitRD} />
          <IncentivePendulum incentivePendulum={incentivePendulumRD} />
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
    [
      isDesktopView,
      desktopPoolsColumns,
      mobilePoolsColumns,
      setFilter,
      poolFilter,
      limitRD,
      incentivePendulumRD,
      history
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
            network
          })
          previousPools.current = O.some(poolViewData)
          return renderPoolsTable(poolViewData)
        }
      )(poolsRD)}
    </>
  )
}
