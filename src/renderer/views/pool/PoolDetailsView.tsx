import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { ErrorView } from '../../components/shared/error'
import { RefreshButton } from '../../components/uielements/button'
import { DEFAULT_GET_POOLS_PERIOD, ONE_BN } from '../../const'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getAssetFromNullableString } from '../../helpers/assetHelper'
import { eqAsset } from '../../helpers/fp/eq'
import { useMidgardHistoryActions } from '../../hooks/useMidgardHistoryActions'
import { usePoolWatchlist } from '../../hooks/usePoolWatchlist'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolDetailRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { PoolChartView } from './PoolChartView'
import * as Styled from './PoolDetailsView.styles'
import { PoolHistoryView } from './PoolHistoryView'

type TargetPoolDetailProps = Omit<
  PoolDetailProps,
  | 'asset'
  | 'historyActions'
  | 'reloadPoolDetail'
  | 'reloadPoolStatsDetail'
  | 'watched'
  | 'watch'
  | 'unwatch'
  | 'setPoolsPeriod'
>

const defaultDetailsProps: TargetPoolDetailProps = {
  priceRatio: ONE_BN,
  HistoryView: PoolHistoryView,
  ChartView: PoolChartView,
  poolDetail: RD.initial,
  poolStatsDetail: RD.initial,
  priceSymbol: '',
  network: DEFAULT_NETWORK,
  poolsPeriod: DEFAULT_GET_POOLS_PERIOD
}

export const PoolDetailsView: React.FC = () => {
  const { network$ } = useAppContext()
  const {
    service: {
      reloadChartDataUI,
      pools: {
        selectedPoolDetail$,
        priceRatio$,
        selectedPricePoolAssetSymbol$,
        poolStatsDetail$,
        reloadPoolStatsDetail,
        reloadSelectedPoolDetail,
        poolsPeriod$,
        setPoolsPeriod
      },
      setSelectedPoolAsset
    }
  } = useMidgardContext()

  const network = useObservableState(network$, DEFAULT_NETWORK)

  const intl = useIntl()

  const { asset } = useParams<PoolDetailRouteParams>()

  const { add: addToWatchList, remove: removeFromWatchList, list: watchedList } = usePoolWatchlist()

  const poolsPeriod = useObservableState(poolsPeriod$, DEFAULT_GET_POOLS_PERIOD)

  const oRouteAsset = useMemo(() => getAssetFromNullableString(asset), [asset])

  // Set selected pool asset whenever an asset in route has been changed
  // Needed to get all data for this pool (pool details etc.)
  useEffect(() => {
    setSelectedPoolAsset(oRouteAsset)
    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oRouteAsset, setSelectedPoolAsset])

  const oPriceSymbol = useObservableState(selectedPricePoolAssetSymbol$, O.none)
  const priceSymbol = FP.pipe(
    oPriceSymbol,
    O.getOrElse(() => '')
  )

  const priceRatio = useObservableState(priceRatio$, ONE_BN)

  const historyActions = useMidgardHistoryActions()

  const { historyPage: historyPageRD, reloadHistory } = historyActions

  const poolDetailRD: PoolDetailRD = useObservableState(selectedPoolDetail$, RD.initial)

  const poolStatsDetailRD: PoolStatsDetailRD = useObservableState(poolStatsDetail$, RD.initial)

  const onRefreshData = useCallback(() => {
    reloadSelectedPoolDetail()
    reloadPoolStatsDetail()
    reloadHistory()
    // trigger reload of chart data, which will be handled in PoolChartView
    reloadChartDataUI()
  }, [reloadChartDataUI, reloadHistory, reloadPoolStatsDetail, reloadSelectedPoolDetail])

  const refreshButtonDisabled = useMemo(() => {
    return FP.pipe(historyPageRD, RD.isPending) || FP.pipe(poolDetailRD, RD.isPending)
  }, [historyPageRD, poolDetailRD])

  const prevProps = useRef<TargetPoolDetailProps>(defaultDetailsProps)

  return (
    <>
      <Styled.ControlsContainer>
        <Styled.BackLink />
        <RefreshButton clickHandler={onRefreshData} disabled={refreshButtonDisabled} />
      </Styled.ControlsContainer>
      {FP.pipe(
        oRouteAsset,
        O.fold(
          () => <ErrorView title={intl.formatMessage({ id: 'routes.invalid.asset' }, { asset })} />,
          (asset) => {
            prevProps.current = {
              network,
              priceRatio,
              poolDetail: poolDetailRD,
              poolStatsDetail: poolStatsDetailRD,
              priceSymbol,
              HistoryView: PoolHistoryView,
              ChartView: PoolChartView,
              poolsPeriod
            }

            const watched = FP.pipe(watchedList, A.elem(eqAsset)(asset))

            return (
              <PoolDetails
                asset={asset}
                watched={watched}
                watch={() => addToWatchList(asset)}
                unwatch={() => removeFromWatchList(asset)}
                historyActions={historyActions}
                reloadPoolDetail={reloadSelectedPoolDetail}
                reloadPoolStatsDetail={reloadPoolStatsDetail}
                setPoolsPeriod={setPoolsPeriod}
                {...prevProps.current}
              />
            )
          }
        )
      )}
    </>
  )
}
