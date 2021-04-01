import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetAmount, assetFromString, baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { RefreshButton } from '../../components/uielements/button'
import { PoolStatus } from '../../components/uielements/poolStatus'
import { ZERO_ASSET_AMOUNT, ONE_BN } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { PoolDetailRD } from '../../services/midgard/types'
import { PoolDetail, SwapHistory } from '../../types/generated/midgard'
import * as Styled from './PoolDetailsView.styles'
import { PoolHistory } from './PoolHistoryView'

// TODO (@asgdx-team) Extract follwing helpers into PoolDetailsView.helper + add tests

const getDepth = (data: Pick<PoolDetail, 'runeDepth'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const get24hrVolume = (data: Pick<PoolDetail, 'volume24h'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

const getAllTimeVolume = (data: Pick<PoolDetail, 'poolAPY'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(/*data.poolVolume*/ 0).multipliedBy(priceRatio)))

const getPriceUSD = (data: Pick<PoolDetail, 'assetPrice'>, priceRatio: BigNumber = bn(1)) =>
  assetAmount(bnOrZero(data.assetPrice).multipliedBy(priceRatio))

const _getTotalSwaps = ({ meta }: SwapHistory) => Number(meta.totalCount)

const _getTotalStakers = (/* _data: ??? */) => 0

const defaultDetailsProps: PoolDetailProps = {
  asset: O.none,
  depth: ZERO_ASSET_AMOUNT,
  volume24hr: ZERO_ASSET_AMOUNT,
  allTimeVolume: ZERO_ASSET_AMOUNT,
  totalSwaps: 0,
  totalStakers: 0,
  priceUSD: ZERO_ASSET_AMOUNT,
  HistoryView: PoolHistory
}

const renderInitialView = () => <PoolDetails {...defaultDetailsProps} />

export const PoolDetailsView: React.FC = () => {
  const {
    service: {
      pools: { selectedPoolDetail$, priceRatio$, selectedPricePoolAssetSymbol$, reloadSelectedPoolDetail },
      poolActionsHistory: { reloadActionsHistory, isHistoryLoading$ },
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

  const routeAssetRD = useMemo(
    () => RD.fromOption(oRouteAsset, () => Error(intl.formatMessage({ id: 'routes.invalid.asset' }, { asset }))),
    [oRouteAsset, asset, intl]
  )

  const priceSymbol = useObservableState(selectedPricePoolAssetSymbol$, O.none)

  const priceRatio = useObservableState(priceRatio$, ONE_BN)

  const isHistoryLoading = useObservableState(isHistoryLoading$, false)

  const poolDetailRD: PoolDetailRD = useObservableState(selectedPoolDetail$, RD.initial)

  const onRefreshData = useCallback(() => {
    reloadSelectedPoolDetail()
    reloadActionsHistory()
  }, [reloadSelectedPoolDetail, reloadActionsHistory])

  const refreshButtonDisabled = useMemo(() => {
    return isHistoryLoading || FP.pipe(poolDetailRD, RD.isPending)
  }, [isHistoryLoading, poolDetailRD])

  const prevProps = useRef<PoolDetailProps>(defaultDetailsProps)

  return (
    <>
      <Styled.ControlsContainer>
        <Styled.BackLink />
        <RefreshButton clickHandler={onRefreshData} disabled={refreshButtonDisabled} />
      </Styled.ControlsContainer>
      {FP.pipe(
        RD.combine(routeAssetRD, poolDetailRD),
        RD.fold(
          renderInitialView,
          () => <PoolDetails {...prevProps.current} isLoading />,
          (e: Error) => {
            return <PoolStatus label={intl.formatMessage({ id: 'common.error' })} displayValue={e.message} />
          },
          ([asset, poolDetail]) => {
            prevProps.current = {
              asset: O.some(asset),
              depth: getDepth(poolDetail, priceRatio),
              volume24hr: get24hrVolume(poolDetail, priceRatio),
              allTimeVolume: getAllTimeVolume(poolDetail, priceRatio),
              totalSwaps: 0 /* getTotalSwaps(history) */,
              totalStakers: 0 /* getTotalStakers(poolDetail) */,
              priceUSD: getPriceUSD(poolDetail, priceRatio),
              priceSymbol: O.toUndefined(priceSymbol),
              HistoryView: PoolHistory
            }

            return <PoolDetails {...prevProps.current} />
          }
        )
      )}
    </>
  )
}
