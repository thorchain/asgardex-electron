import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { poolDetailMock, poolStatsDetailMock } from '../../../shared/mock/pool'
import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { ErrorView } from '../../components/shared/error'
import { RefreshButton } from '../../components/uielements/button'
import { ONE_BN } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { PoolDetailRD, PoolEarningHistoryRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { PoolChartView } from './PoolChartView'
import * as Styled from './PoolDetailsView.styles'
import { PoolHistory } from './PoolHistoryView'

type TargetPoolDetailProps = Omit<PoolDetailProps, 'asset'>

const defaultDetailsProps: TargetPoolDetailProps = {
  priceRatio: ONE_BN,
  HistoryView: PoolHistory,
  ChartView: PoolChartView,
  poolDetail: poolDetailMock,
  poolStatsDetail: poolStatsDetailMock,
  earningsHistory: O.none
}

export const PoolDetailsView: React.FC = () => {
  const {
    service: {
      pools: {
        selectedPoolDetail$,
        priceRatio$,
        selectedPricePoolAssetSymbol$,
        poolStatsDetail$,
        poolEarningHistory$,
        reloadSelectedPoolDetail,
        haltedChains$
      },
      poolActionsHistory: { reloadActionsHistory, actions$ },
      setSelectedPoolAsset
    }
  } = useMidgardContext()

  const intl = useIntl()

  const { asset } = useParams<PoolDetailRouteParams>()

  const [haltedChains] = useObservableState(() => FP.pipe(haltedChains$, RxOp.map(RD.getOrElse((): Chain[] => []))), [])

  const oRouteAsset = useMemo(() => O.fromNullable(assetFromString(asset.toUpperCase())), [asset])

  // Set selected pool asset whenever an asset in route has been changed
  // Needed to get all data for this pool (pool details etc.)
  useEffect(() => {
    setSelectedPoolAsset(oRouteAsset)
    // Reset selectedPoolAsset on view's unmount to avoid effects with depending streams
    return () => {
      setSelectedPoolAsset(O.none)
    }
  }, [oRouteAsset, setSelectedPoolAsset])

  const priceSymbol = useObservableState(selectedPricePoolAssetSymbol$, O.none)

  const priceRatio = useObservableState(priceRatio$, ONE_BN)

  const [isHistoryLoading] = useObservableState(() => FP.pipe(actions$, RxOp.map(RD.isPending)), false)

  const poolDetailRD: PoolDetailRD = useObservableState(selectedPoolDetail$, RD.initial)

  const poolStatsDetailRD: PoolStatsDetailRD = useObservableState(poolStatsDetail$, RD.initial)
  const poolEarningHistoryRD: PoolEarningHistoryRD = useObservableState(poolEarningHistory$, RD.initial)

  const onRefreshData = useCallback(() => {
    reloadSelectedPoolDetail()
    reloadActionsHistory()
  }, [reloadSelectedPoolDetail, reloadActionsHistory])

  const refreshButtonDisabled = useMemo(() => {
    return isHistoryLoading || FP.pipe(poolDetailRD, RD.isPending)
  }, [isHistoryLoading, poolDetailRD])

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
          (asset) =>
            FP.pipe(
              RD.combine(poolDetailRD, poolStatsDetailRD, poolEarningHistoryRD),
              RD.fold(
                () => <PoolDetails haltedChains={haltedChains} asset={asset} {...defaultDetailsProps} />,
                () => <PoolDetails haltedChains={haltedChains} asset={asset} {...prevProps.current} isLoading />,
                ({ message }: Error) => {
                  return <ErrorView title={message} />
                },
                ([poolDetail, poolStatsDetail, poolEarningHistory]) => {
                  prevProps.current = {
                    priceRatio,
                    poolDetail,
                    poolStatsDetail,
                    earningsHistory: poolEarningHistory,
                    priceSymbol: O.toUndefined(priceSymbol),
                    HistoryView: PoolHistory,
                    ChartView: PoolChartView
                  }

                  return <PoolDetails haltedChains={haltedChains} asset={asset} {...prevProps.current} />
                }
              )
            )
        )
      )}
    </>
  )
}
