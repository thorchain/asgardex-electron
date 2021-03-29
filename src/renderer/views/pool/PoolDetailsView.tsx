import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { PoolStatus } from '../../components/uielements/poolStatus'
import { ZERO_ASSET_AMOUNT, ONE_BN } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { PoolDetailRouteParams } from '../../routes/pools/detail'
import { PoolDetailRD } from '../../services/midgard/types'
import { PoolDetail, SwapHistory } from '../../types/generated/midgard'

// TODO (@asgdx-team) Extract follwing helpers into PoolDetailsView.helper + add tests

const getDepth = (data: Pick<PoolDetail, 'runeDepth'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const get24hrVolume = (data: Pick<PoolDetail, 'volume24h'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

const getAllTimeVolume = (data: Pick<PoolDetail, 'poolAPY'>, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(/*data.poolVolume*/ 0).multipliedBy(priceRatio)))

const _getTotalSwaps = ({ meta }: SwapHistory) => Number(meta.totalCount)

const _getTotalStakers = (/* _data: ??? */) => 0

const defaultDetailsProps: PoolDetailProps = {
  asset: O.none,
  depth: ZERO_ASSET_AMOUNT,
  volume24hr: ZERO_ASSET_AMOUNT,
  allTimeVolume: ZERO_ASSET_AMOUNT,
  totalSwaps: 0,
  totalStakers: 0,
  priceUSD: O.none
}

const renderPendingView = () => <PoolDetails {...defaultDetailsProps} isLoading={true} />
const renderInitialView = () => <PoolDetails {...defaultDetailsProps} />

export const PoolDetailsView: React.FC = () => {
  const {
    service: {
      pools: { selectedPoolDetail$, priceRatio$, selectedPricePoolAssetSymbol$ },
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

  const poolDetailRD: PoolDetailRD = useObservableState(selectedPoolDetail$, RD.initial)

  return FP.pipe(
    poolDetailRD,
    RD.fold(
      renderInitialView,
      renderPendingView,
      (e: Error) => {
        return <PoolStatus label={intl.formatMessage({ id: 'common.error' })} displayValue={e.message} />
      },
      (poolDetail) => {
        return (
          <PoolDetails
            asset={oRouteAsset}
            depth={getDepth(poolDetail, priceRatio)}
            volume24hr={get24hrVolume(poolDetail, priceRatio)}
            allTimeVolume={getAllTimeVolume(poolDetail, priceRatio)}
            totalSwaps={0 /* getTotalSwaps(history) */}
            totalStakers={0 /* getTotalStakers(poolDetail) */}
            priceUSD={O.some(poolDetail.assetPriceUSD)}
            priceSymbol={O.toUndefined(priceSymbol)}
          />
        )
      }
    )
  )
}
