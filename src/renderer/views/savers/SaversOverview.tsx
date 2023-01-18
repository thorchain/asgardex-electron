import { useCallback, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import {
  Asset,
  assetFromString,
  assetToString,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  formatBN
} from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Chain } from '../../../shared/utils/chain'
import { FlatButton } from '../../components/uielements/button'
import { PoolsPeriodSelector } from '../../components/uielements/pools/PoolsPeriodSelector'
import { Table } from '../../components/uielements/table'
import { DEFAULT_GET_POOLS_PERIOD, DEFAULT_WALLET_TYPE } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { isChainAsset } from '../../helpers/assetHelper'
import { ordBigNumber } from '../../helpers/fp/ord'
import { sequenceTRD } from '../../helpers/fpHelpers'
import * as PoolHelpers from '../../helpers/poolHelper'
import { getSaversTableRowsData, ordSaversByDepth } from '../../helpers/savers'
import { useNetwork } from '../../hooks/useNetwork'
import { usePoolWatchlist } from '../../hooks/usePoolWatchlist'
import { useSynthConstants } from '../../hooks/useSynthConstants'
import * as poolsRoutes from '../../routes/pools'
import * as saversRoutes from '../../routes/pools/savers'
import { PoolDetails, PoolsState } from '../../services/midgard/types'
import type { MimirHalt } from '../../services/thorchain/types'
import { GetPoolsPeriodEnum } from '../../types/generated/midgard'
import * as Shared from '../pools/PoolsOverview.shared'
import type { SaversTableRowData, SaversTableRowsData } from './Savers.types'

export type Props = {
  haltedChains: Chain[]
  mimirHalt: MimirHalt
  walletLocked: boolean
}

export const SaversOverview: React.FC<Props> = (props): JSX.Element => {
  const { haltedChains, mimirHalt, walletLocked } = props
  const intl = useIntl()
  const navigate = useNavigate()
  const { network } = useNetwork()

  const {
    service: {
      pools: { poolsState$, reloadPools, selectedPricePool$, poolsPeriod$, setPoolsPeriod }
    }
  } = useMidgardContext()

  const poolsPeriod = useObservableState(poolsPeriod$, DEFAULT_GET_POOLS_PERIOD)

  const { maxSynthPerPoolDepth: maxSynthPerPoolDepthRD, reloadConstants } = useSynthConstants()

  const refreshHandler = useCallback(() => {
    reloadPools()
    reloadConstants()
  }, [reloadConstants, reloadPools])

  const selectedPricePool = useObservableState(selectedPricePool$, PoolHelpers.RUNE_PRICE_POOL)

  const poolsRD = useObservableState(poolsState$, RD.pending)

  // store previous data of pools to render these while reloading
  const previousSavers = useRef<O.Option<SaversTableRowsData>>(O.none)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const { add: addPoolToWatchlist, remove: removePoolFromWatchlist, list: poolWatchList } = usePoolWatchlist()

  const depthColumn = useCallback(
    <T extends { asset: Asset; depth: BaseAmount; depthPrice: BaseAmount }>(pricePoolAsset: Asset): ColumnType<T> => ({
      key: 'depth',
      align: 'right',
      title: intl.formatMessage({ id: 'common.liquidity' }),
      render: ({ asset, depth, depthPrice }: { asset: Asset; depth: BaseAmount; depthPrice: BaseAmount }) => (
        <div className="flex flex-col items-end justify-center font-main">
          <div className="whitespace-nowrap text-16 text-text0 dark:text-text0d">
            {formatAssetAmountCurrency({
              amount: baseToAsset(depth),
              asset,
              decimal: 3
            })}
          </div>
          <div className="whitespace-nowrap text-14 text-gray2 dark:text-gray2d">
            {formatAssetAmountCurrency({
              amount: baseToAsset(depthPrice),
              asset: pricePoolAsset,
              decimal: 2
            })}
          </div>
        </div>
      ),
      sorter: ordSaversByDepth,
      sortDirections: ['descend', 'ascend'],
      // Note: `defaultSortOrder` has no effect here, that's we do a default sort in `getPoolTableRowsData`
      defaultSortOrder: 'descend'
    }),
    [intl]
  )

  const aprColumn = useCallback(
    <T extends { apr: BigNumber }>(
      poolsPeriod: GetPoolsPeriodEnum,
      setPoolsPeriod: (v: GetPoolsPeriodEnum) => void
    ): ColumnType<T> => ({
      key: 'apr',
      align: 'center',
      title: (
        <div className="flex flex-col items-center">
          <div className="font-main text-[12px]">{intl.formatMessage({ id: 'pools.apr' })}</div>
          <PoolsPeriodSelector selectedValue={poolsPeriod} onChange={setPoolsPeriod} />
        </div>
      ),
      render: ({ apr }: { apr: BigNumber }) => <div className="font-main text-16">{formatBN(apr, 2)}%</div>,
      sorter: (a: { apr: BigNumber }, b: { apr: BigNumber }) => ordBigNumber.compare(a.apr, b.apr),
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const filledColumn = useCallback(
    <T extends { filled: BigNumber }>(): ColumnType<T> => ({
      key: 'filled',
      align: 'center',
      title: intl.formatMessage({ id: 'pools.filled' }),
      render: ({ filled }: { filled: BigNumber }) => (
        <div className="flex flex-col justify-start">
          <div className="font-main text-16">{formatBN(filled, 2)}%</div>
          <div className="relative my-[6px] h-[5px] w-full bg-gray1 dark:bg-gray1d">
            <div
              className="absolute h-[5px] bg-turquoise"
              style={{ width: `${Math.min(filled.toNumber(), 100) /* max. 100% */}%` }}></div>
          </div>
        </div>
      ),
      sorter: (a: { filled: BigNumber }, b: { filled: BigNumber }) => ordBigNumber.compare(a.filled, b.filled),
      sortDirections: ['descend', 'ascend']
    }),
    [intl]
  )

  const renderBtnColumn = useCallback(
    (_: string, { asset }: { asset: Asset }) => {
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

      // TODO(@veado) Enable savers
      const _disabled = disableAllPoolActions || disableTradingActions || disablePoolActions || walletLocked

      const onClickHandler = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.preventDefault()
        event.stopPropagation()
        navigate(saversRoutes.earn.path({ asset: assetToString(asset), walletType: DEFAULT_WALLET_TYPE }))
      }

      return (
        <div className="relative flex flex-col items-center justify-center">
          <FlatButton className="min-w-[120px]" disabled={true} size="normal" onClick={onClickHandler}>
            {intl.formatMessage({ id: 'common.manage' })}
          </FlatButton>
          <div className="absolute translate-y-[-50%] rotate-[-30deg] rounded-sm bg-bg0 px-10px font-mainSemiBold text-[10px] uppercase text-warning0 shadow-md dark:bg-bg0d dark:text-warning0d">
            coming soon
          </div>
        </div>
      )
    },

    [haltedChains, intl, mimirHalt, navigate, walletLocked]
  )

  const btnColumn = useCallback(
    <T extends { asset: Asset }>(): ColumnType<T> => ({
      key: 'btn',
      title: Shared.renderRefreshBtnColTitle({
        title: intl.formatMessage({ id: 'common.refresh' }),
        clickHandler: refreshHandler,
        iconOnly: !isDesktopView
      }),
      width: 280,
      render: renderBtnColumn
    }),
    [refreshHandler, intl, renderBtnColumn, isDesktopView]
  )

  const desktopColumns: ColumnsType<SaversTableRowData> = useMemo(
    () => [
      Shared.watchColumn(addPoolToWatchlist, removePoolFromWatchlist),
      Shared.poolColumn(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn(intl.formatMessage({ id: 'common.asset' })),
      depthColumn<SaversTableRowData>(selectedPricePool.asset),
      filledColumn<SaversTableRowData>(),
      aprColumn<SaversTableRowData>(poolsPeriod, setPoolsPeriod),
      btnColumn()
    ],
    [
      addPoolToWatchlist,
      aprColumn,
      btnColumn,
      depthColumn,
      filledColumn,
      poolsPeriod,
      intl,
      removePoolFromWatchlist,
      selectedPricePool.asset,
      setPoolsPeriod
    ]
  )

  const mobileColumns: ColumnsType<SaversTableRowData> = useMemo(
    () => [
      Shared.poolColumnMobile<SaversTableRowData>(intl.formatMessage({ id: 'common.pool' })),
      Shared.assetColumn<SaversTableRowData>(intl.formatMessage({ id: 'common.asset' })),
      btnColumn()
    ],
    [btnColumn, intl]
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
      {FP.pipe(
        sequenceTRD(poolsRD, maxSynthPerPoolDepthRD),
        RD.fold(
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
          ([pools, maxSynthPerPoolDepth]): JSX.Element => {
            const { poolDetails }: PoolsState = pools
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
              maxSynthPerPoolDepth,
              network
            })
            previousSavers.current = O.some(poolViewData)
            return renderTable(poolViewData)
          }
        )
      )}
    </>
  )
}
