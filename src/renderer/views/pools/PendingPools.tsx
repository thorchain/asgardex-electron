import React, { useCallback, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { ManageButton } from '../../components/manageButton'
import { Table } from '../../components/uielements/table'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getPoolTableRowsData, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import { DEFAULT_NETWORK } from '../../services/const'
import { PendingPoolsState, PoolAssets } from '../../services/midgard/types'
import { PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { getBlocksLeftForPendingPoolAsString } from './Pools.utils'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import { TableAction, BlockLeftLabel } from './PoolsOverview.style'
import * as Styled from './PoolsOverview.style'

export const PendingPools: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()
  const {
    thorchainLastblockState$,
    thorchainConstantsState$,
    pools: { pendingPoolsState$, reloadPendingPools, selectedPricePool$ },
    reloadNetworkInfo,
    reloadThorchainLastblock
  } = midgardService

  const poolsRD = useObservableState(pendingPoolsState$, RD.pending)
  const thorchainLastblockRD = useObservableState(thorchainLastblockState$, RD.pending)
  const thorchainConstantsRD = useObservableState(thorchainConstantsState$, RD.pending)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pending pools to render these while reloading
  const previousPools = useRef<Option<PoolTableRowsData>>(none)

  const refreshHandler = useCallback(() => {
    reloadPendingPools()
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadPendingPools])

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

  const [filteredPoolAssets, setFilteredPoolAssets] = useState<PoolAssets>()

  const lastblock = useMemo(() => RD.toNullable(thorchainLastblockRD), [thorchainLastblockRD])
  const constants = useMemo(() => RD.toNullable(thorchainConstantsRD), [thorchainConstantsRD])

  const renderBlockLeftColumn = useCallback(
    (_: string, record: PoolTableRowData) => {
      const { deepest, pool } = record

      const blocksLeft =
        lastblock && constants ? getBlocksLeftForPendingPoolAsString(constants, lastblock, pool.asset) : ''

      return (
        <TableAction>
          <BlockLeftLabel>{deepest ? blocksLeft.toString() : ''}</BlockLeftLabel>
        </TableAction>
      )
    },
    [lastblock, constants]
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
            onFilterChanged={setFilteredPoolAssets}
            assets={FP.pipe(
              tableData,
              A.map(({ pool }) => pool.target)
            )}
          />
          <Table
            columns={columns}
            dataSource={FP.pipe(tableData, filterTableData(filteredPoolAssets))}
            loading={loading}
            rowKey="key"
          />
        </>
      )
    },
    [isDesktopView, desktopPoolsColumns, mobilePoolsColumns, filteredPoolAssets]
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
