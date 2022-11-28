import { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, assetToString, Chain } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Table } from '../../components/uielements/table'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { isChainAsset } from '../../helpers/assetHelper'
import * as PoolHelpers from '../../helpers/poolHelper'
import { getSaversTableRowsData } from '../../helpers/savers'
import { useNetwork } from '../../hooks/useNetwork'
import { usePoolWatchlist } from '../../hooks/usePoolWatchlist'
import * as poolsRoutes from '../../routes/pools'
import { PoolDetails, PoolsState } from '../../services/midgard/types'
import type { MimirHalt } from '../../services/thorchain/types'
import * as Shared from '../pools/PoolsOverview.shared'
import type { SaversTableRowData, SaversTableRowsData } from './Savers.types'

export type Props = {
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  walletLocked: boolean
}

export const SaversOverview: React.FC<Props> = (): JSX.Element => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { network } = useNetwork()

  const {
    service: {
      pools: { poolsState$, reloadPools, selectedPricePool$ }
    }
  } = useMidgardContext()

  const refreshHandler = useCallback(() => {
    reloadPools()
  }, [reloadPools])

  const selectedPricePool = useObservableState(selectedPricePool$, PoolHelpers.RUNE_PRICE_POOL)

  const poolsRD = useObservableState(poolsState$, RD.pending)

  // store previous data of pools to render these while reloading
  const previousSavers = useRef<O.Option<SaversTableRowsData>>(O.none)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const { add: addPoolToWatchlist, remove: removePoolFromWatchlist, list: poolWatchList } = usePoolWatchlist()

  const desktopColumns: ColumnsType<SaversTableRowData> = useMemo(
    () => [
      Shared.watchColumn(addPoolToWatchlist, removePoolFromWatchlist),
      Shared.poolColumnMobile(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' }))
    ],
    [addPoolToWatchlist, intl, removePoolFromWatchlist]
  )

  const mobileColumns: ColumnsType<SaversTableRowData> = useMemo(
    () => [
      Shared.poolColumnMobile<SaversTableRowData>(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn<SaversTableRowData>(intl.formatMessage({ id: 'common.asset' }))
    ],
    [intl]
  )

  const renderTable = useCallback(
    (tableData: SaversTableRowsData, loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns

      return (
        <>
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            rowKey="key"
            onRow={({ asset }: SaversTableRowData) => {
              return {
                onClick: () => {
                  navigate(poolsRoutes.detail.path({ asset: assetToString(asset) }))
                }
              }
            }}
          />
        </>
      )
    },
    [desktopColumns, isDesktopView, mobileColumns, navigate]
  )

  return (
    <>
      {RD.fold(
        // initial state
        () => renderTable([], true),
        // loading state
        () => {
          const pools = O.getOrElse(() => [] as SaversTableRowsData)(previousSavers.current)
          return renderTable(pools, true)
        },
        // render error state
        Shared.renderTableError(intl.formatMessage({ id: 'common.refresh' }), refreshHandler),
        // success state
        ({ poolDetails }: PoolsState): JSX.Element => {
          // filter chain assets
          const poolDetailsFiltered: PoolDetails = FP.pipe(
            poolDetails,
            A.filter(({ asset: assetString }) =>
              FP.pipe(
                assetString,
                assetFromString,
                O.fromNullable,
                O.map(isChainAsset),
                O.getOrElse(() => false)
              )
            )
          )

          const poolViewData = getSaversTableRowsData({
            poolDetails: poolDetailsFiltered,
            pricePoolData: selectedPricePool.poolData,
            watchlist: poolWatchList,
            network
          })
          previousSavers.current = O.some(poolViewData)
          return renderTable(poolViewData)
        }
      )(poolsRD)}
    </>
  )
}
