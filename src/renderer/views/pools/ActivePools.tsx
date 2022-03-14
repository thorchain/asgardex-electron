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
import { useHistory } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { ManageButton } from '../../components/manageButton'
import { FundsCap } from '../../components/pool'
import { Button } from '../../components/uielements/button'
import { Table } from '../../components/uielements/table'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { ordBaseAmount, ordNumber } from '../../helpers/fp/ord'
import * as PoolHelpers from '../../helpers/poolHelper'
import { useFundsCap } from '../../hooks/useFundsCap'
import * as poolsRoutes from '../../routes/pools'
import { SwapRouteParams } from '../../routes/pools/swap'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolFilter, PoolsState } from '../../services/midgard/types'
import { PoolsComponentProps, PoolTableRowData, PoolTableRowsData } from './Pools.types'
import { filterTableData } from './Pools.utils'
import * as Shared from './PoolsOverview.shared'
import * as Styled from './PoolsOverview.styles'

const POOLS_KEY = 'active'

export const ActivePools: React.FC<PoolsComponentProps> = ({ haltedChains, mimirHalt, walletLocked }): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { service: midgardService } = useMidgardContext()
  const { reload: reloadFundsCap, data: fundsCapRD } = useFundsCap()
  const {
    pools: { poolsState$, reloadPools, selectedPricePool$, poolsFilters$, setPoolsFilter }
  } = midgardService
  const poolsRD = useObservableState(poolsState$, RD.pending)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of pools to render these while reloading
  const previousPools = useRef<O.Option<PoolTableRowsData>>(O.none)

  const [poolFilter] = useObservableState<O.Option<PoolFilter>>(
    () =>
      FP.pipe(
        poolsFilters$,
        RxOp.map((filters) => FP.pipe(O.fromNullable(filters[POOLS_KEY]), O.flatten))
      ),
    O.none
  )

  const setFilter = useCallback((oFilter: O.Option<PoolFilter>) => setPoolsFilter(POOLS_KEY, oFilter), [setPoolsFilter])

  const refreshHandler = useCallback(() => {
    reloadPools()
    reloadFundsCap()
  }, [reloadPools, reloadFundsCap])

  const selectedPricePool = useObservableState(selectedPricePool$, PoolHelpers.RUNE_PRICE_POOL)

  const clickSwapHandler = useCallback(
    (p: SwapRouteParams) => {
      history.push(poolsRoutes.swap.path(p))
    },
    [history]
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
    () => [
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      Shared.priceColumn(intl.formatMessage({ id: 'common.price' }), selectedPricePool.asset),
      Shared.depthColumn(intl.formatMessage({ id: 'common.liquidity' }), selectedPricePool.asset),
      volumeColumn,
      apyColumn,
      btnPoolsColumn
    ],
    [intl, selectedPricePool.asset, volumeColumn, apyColumn, btnPoolsColumn]
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

      return (
        <>
          <Styled.AssetsFilter
            activeFilter={poolFilter}
            setFilter={setFilter}
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
    [isDesktopView, desktopPoolsColumns, mobilePoolsColumns, poolFilter, setFilter, fundsCapRD, history]
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
            network
          })
          previousPools.current = O.some(poolViewData)
          return renderPoolsTable(poolViewData)
        }
      )(poolsRD)}
    </>
  )
}
