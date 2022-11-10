import React, { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import {
  AssetRuneNative,
  assetToString,
  baseToAsset,
  bn,
  formatAssetAmountCurrency,
  formatBN
} from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { ProtocolLimit, IncentivePendulum } from '../../components/pool'
import { Action as ActionButtonAction, ActionButton } from '../../components/uielements/button/ActionButton'
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

  const renderBtnPoolsColumn = useCallback(
    (_: string, { asset }: PoolTableRowData) => {
      const chain = asset.chain
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

      const actions: ActionButtonAction[] = [
        {
          label: intl.formatMessage({ id: 'common.swap' }),
          disabled: disableAllPoolActions || disableTradingActions,
          callback: () => {
            navigate(poolsRoutes.swap.path({ source: assetToString(AssetRuneNative), target: assetToString(asset) }))
          }
        },
        {
          label: intl.formatMessage({ id: 'common.manage' }),
          disabled: disableAllPoolActions || disablePoolActions || walletLocked,
          callback: () => {
            navigate(poolsRoutes.deposit.path({ asset: assetToString(asset) }))
          }
        },
        {
          label: intl.formatMessage({ id: 'common.savers' }),
          disabled: disableAllPoolActions || disableTradingActions,
          callback: () => {
            navigate(poolsRoutes.savers.path({ asset: assetToString(asset) }))
          }
        }
      ]

      return (
        <Styled.TableAction>
          <ActionButton size="normal" actions={actions} />
        </Styled.TableAction>
      )
    },

    [haltedChains, mimirHalt, intl, walletLocked, navigate]
  )

  const btnPoolsColumn = useMemo(
    () => ({
      key: 'btn',
      title: Shared.renderRefreshBtnColTitle({
        title: intl.formatMessage({ id: 'common.refresh' }),
        clickHandler: refreshHandler,
        iconOnly: !isDesktopView
      }),
      width: 280,
      render: renderBtnPoolsColumn
    }),
    [refreshHandler, intl, renderBtnPoolsColumn, isDesktopView]
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
            onRow={({ asset }: PoolTableRowData) => {
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
