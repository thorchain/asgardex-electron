import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { ErrorView } from '../../components/shared/error'
import { RefreshButton } from '../../components/uielements/button'
import { ZERO_ASSET_AMOUNT, ONE_BN, ZERO_BN } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { PoolDetailRD, PoolEarningHistoryRD, PoolStatsDetailRD } from '../../services/midgard/types'
import { EarningsHistoryItemPool, PoolStatsDetail } from '../../types/generated/midgard'
import * as Styled from './PoolDetailsView.styles'
import { PoolHistory } from './PoolHistoryView'

const getEarnings = (oData: O.Option<EarningsHistoryItemPool>, priceRatio: BigNumber = bn(1)) =>
  FP.pipe(
    oData,
    O.fold(
      () => ZERO_ASSET_AMOUNT,
      (data) => baseToAsset(baseAmount(bnOrZero(data.earnings).multipliedBy(priceRatio)))
    )
  )

const getTotalSwaps = (data: Pick<PoolStatsDetail, 'swapCount'>) => bn(data.swapCount)

const getTotalTx = (data: PoolStatsDetail) => bn(data.swapCount).plus(data.addLiquidityCount).plus(data.withdrawCount)

const getMembers = (data: Pick<PoolStatsDetail, 'uniqueMemberCount'>) => bn(data.uniqueMemberCount)

const getFees = (data: Pick<PoolStatsDetail, 'totalFees'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.totalFees).multipliedBy(priceRatio)))

type TargetPoolDetailProps = Omit<PoolDetailProps, 'asset'>

const defaultDetailsProps: TargetPoolDetailProps = {
  poolDetail: {
    asset: 'asset',
    assetDepth: '0',
    assetPrice: '0',
    assetPriceUSD: '0',
    poolAPY: '0',
    runeDepth: '0',
    status: '',

    units: '0',
    volume24h: ''
  },
  priceRatio: ZERO_BN,
  earnings: ZERO_ASSET_AMOUNT,
  fees: ZERO_ASSET_AMOUNT,
  totalTx: bn(0),
  totalSwaps: bn(0),
  members: bn(0),
  HistoryView: PoolHistory
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
        reloadSelectedPoolDetail
      },
      poolActionsHistory: { reloadActionsHistory, actions$ },
      setSelectedPoolAsset
    }
  } = useMidgardContext()

  const intl = useIntl()

  const { asset } = useParams<PoolDetailRouteParams>()

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
                () => <PoolDetails asset={asset} {...defaultDetailsProps} />,
                () => <PoolDetails asset={asset} {...prevProps.current} isLoading />,
                ({ message }: Error) => {
                  return <ErrorView title={message} />
                },
                ([poolDetail, poolStatsDetail, poolEarningHistory]) => {
                  prevProps.current = {
                    priceRatio,
                    poolDetail: poolDetail,
                    earnings: getEarnings(poolEarningHistory, priceRatio),
                    fees: getFees(poolStatsDetail, priceRatio),
                    totalTx: getTotalTx(poolStatsDetail),
                    totalSwaps: getTotalSwaps(poolStatsDetail),
                    members: getMembers(poolStatsDetail),
                    priceSymbol: O.toUndefined(priceSymbol),
                    HistoryView: PoolHistory
                  }

                  return <PoolDetails asset={asset} {...prevProps.current} />
                }
              )
            )
        )
      )}
    </>
  )
}
