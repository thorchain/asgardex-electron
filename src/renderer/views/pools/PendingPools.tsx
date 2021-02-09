import React, { useCallback, useMemo, useRef } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { assetToString } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import * as O from 'fp-ts/lib/Option'
import { Option, none, some } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Button } from '../../components/uielements/button'
import { Table } from '../../components/uielements/table'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getPoolTableRowsData, RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import useInterval, { INACTIVE_INTERVAL } from '../../hooks/useInterval'
import * as depositRoutes from '../../routes/deposit'
import { PendingPoolsState } from '../../services/midgard/types'
import { PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { getBlocksLeftForPendingPoolAsString } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import { TableAction, BlockLeftLabel } from './PoolsOverview.style'
import * as SharedT from './PoolsOverview.types'

export const PendingPools: React.FC<SharedT.Props> = ({ refreshHandler }): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { service: midgardService } = useMidgardContext()
  const {
    thorchainLastblockState$,
    thorchainConstantsState$,
    pools: { pendingPoolsState$, selectedPricePool$ },
    reloadThorchainLastblock
  } = midgardService

  const pendingPoolsRD = useObservableState(pendingPoolsState$, RD.pending)
  const thorchainLastblockRD = useObservableState(thorchainLastblockState$, RD.pending)
  const thorchainConstantsRD = useObservableState(thorchainConstantsState$, RD.pending)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

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

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const getDepositPath = depositRoutes.deposit.path

  const clickDepositHandler = useCallback(
    (asset: string) => {
      history.push(getDepositPath({ asset }))
    },
    [history, getDepositPath]
  )

  const renderBtnPendingPoolsColumn = useCallback(
    (_: string, { pool }: PoolTableRowData) => (
      <TableAction>
        <Button round="true" onClick={() => clickDepositHandler(assetToString(pool.target))} typevalue="outline">
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
      title: Shared.renderRefreshBtnColTitle(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
      width: 200,
      render: renderBtnPendingPoolsColumn
    }),
    [refreshHandler, intl, renderBtnPendingPoolsColumn]
  )

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

  const desktopPendingPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      Shared.priceColumn(intl.formatMessage({ id: 'common.price' })),
      Shared.depthColumn(intl.formatMessage({ id: 'pools.depth' }), selectedPricePool.asset),
      blockLeftColumn,
      btnPendingPoolsColumn
    ],
    [intl, selectedPricePool.asset, blockLeftColumn, btnPendingPoolsColumn]
  )

  const mobilePendingPoolsColumns: ColumnsType<PoolTableRowData> = useMemo(
    () => [Shared.poolColumnMobile(intl.formatMessage({ id: 'common.pool' })), btnPendingPoolsColumn],
    [btnPendingPoolsColumn, intl]
  )

  const renderPendingPoolsTable = useCallback(
    (tableData: PoolTableRowData[], loading = false) => {
      const columns = isDesktopView ? desktopPendingPoolsColumns : mobilePendingPoolsColumns
      return <Table columns={columns} dataSource={tableData} loading={loading} rowKey="key" />
    },
    [isDesktopView, desktopPendingPoolsColumns, mobilePendingPoolsColumns]
  )

  return (
    <>
      {RD.fold(
        // initial state
        () => renderPendingPoolsTable([], true),
        // loading state
        () => {
          const pools = O.getOrElse(() => [] as PoolTableRowsData)(previousPendingPools.current)
          return renderPendingPoolsTable(pools, true)
        },
        // render error state
        Shared.renderTableError(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
        // success state
        ({ poolDetails }: PendingPoolsState): JSX.Element => {
          const poolViewData = getPoolTableRowsData({
            poolDetails,
            pricePoolData: selectedPricePool.poolData
          })
          previousPendingPools.current = some(poolViewData)
          return renderPendingPoolsTable(poolViewData)
        }
      )(pendingPoolsRD)}
    </>
  )
}
