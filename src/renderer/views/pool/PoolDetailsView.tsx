import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { ErrorView } from '../../components/shared/error'
import { RefreshButton } from '../../components/uielements/button'
import { ONE_BN } from '../../const'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { getAssetFromNullableString } from '../../helpers/assetHelper'
import * as PoolHelpers from '../../helpers/poolHelper'
import { useMidgardHistoryActions } from '../../hooks/useMidgardHistoryActions'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { DEFAULT_NETWORK } from '../../services/const'
import { PoolDetailRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { PoolChartView } from './PoolChartView'
import * as Styled from './PoolDetailsView.styles'
import { PoolHistoryView } from './PoolHistoryView'

type TargetPoolDetailProps = Omit<
  PoolDetailProps,
  'asset' | 'historyActions' | 'reloadPoolDetail' | 'reloadPoolStatsDetail'
>

const defaultDetailsProps: TargetPoolDetailProps = {
  priceRatio: ONE_BN,
  HistoryView: PoolHistoryView,
  ChartView: PoolChartView,
  poolDetail: RD.initial,
  poolStatsDetail: RD.initial,
  priceSymbol: '',
  network: DEFAULT_NETWORK,
  disableAllPoolActions: false,
  disableTradingPoolAction: false,
  disablePoolActions: false
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
        haltedChains$
      },
      setSelectedPoolAsset
    }
  } = useMidgardContext()

  const network = useObservableState(network$, DEFAULT_NETWORK)

  const intl = useIntl()

  const { asset } = useParams<PoolDetailRouteParams>()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])
  const { mimirHalt } = useMimirHalt()

  const getDisableAllPoolActions = useCallback(
    (chain: Chain) => PoolHelpers.disableAllActions({ chain, haltedChains, mimirHalt }),
    [haltedChains, mimirHalt]
  )
  const getDisableTradingPoolAction = useCallback(
    (chain: Chain) => PoolHelpers.disableTradingActions({ chain, haltedChains, mimirHalt }),
    [haltedChains, mimirHalt]
  )
  const getDisablePoolActions = useCallback(
    (chain: Chain) => PoolHelpers.disablePoolActions({ chain, haltedChains, mimirHalt }),
    [haltedChains, mimirHalt]
  )

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
              disableAllPoolActions: getDisableAllPoolActions(asset.chain),
              disableTradingPoolAction: getDisableTradingPoolAction(asset.chain),
              disablePoolActions: getDisablePoolActions(asset.chain)
            }

            return (
              <PoolDetails
                asset={asset}
                historyActions={historyActions}
                reloadPoolDetail={reloadSelectedPoolDetail}
                reloadPoolStatsDetail={reloadPoolStatsDetail}
                {...prevProps.current}
              />
            )
          }
        )
      )}
    </>
  )
}
