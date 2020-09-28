import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount, baseToAsset, bn, bnOrZero } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { PoolDetails, Props as PoolDetailProps } from '../../../components/stake/PoolDetails/PoolDetails'
import PoolStatus from '../../../components/uielements/poolStatus'
import { ZERO_ASSET_AMOUNT, ONE_BN } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { PoolDetail } from '../../../types/generated/midgard/models'

const getDepth = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const get24hrVolume = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.poolVolume24hr).multipliedBy(priceRatio)))

const getAllTimeVolume = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.poolVolume).multipliedBy(priceRatio)))

const getTotalSwaps = (data: PoolDetail) => Number(data.swappingTxCount || 0)

const getTotalStakers = (data: PoolDetail) => Number(data.stakersCount || 0)

const getReturnToDate = (data: PoolDetail) => (parseFloat(data.poolROI || '0') * 100).toFixed(2)

const defaultDetailsProps: PoolDetailProps = {
  depth: ZERO_ASSET_AMOUNT,
  volume24hr: ZERO_ASSET_AMOUNT,
  allTimeVolume: ZERO_ASSET_AMOUNT,
  totalSwaps: 0,
  totalStakers: 0,
  returnToDate: ''
}

const renderPendingView = () => <PoolDetails {...defaultDetailsProps} isLoading={true} />
const renderInitialView = () => <PoolDetails {...defaultDetailsProps} />

type Props = {}
export const PoolDetailsView: React.FC<Props> = () => {
  const { service: midgardService } = useMidgardContext()
  const intl = useIntl()

  const priceSymbol = useObservableState(midgardService.pools.selectedPricePoolAssetSymbol$, O.none)

  const priceRatio = useObservableState(midgardService.pools.priceRatio$, ONE_BN)

  const detailedPoolData = useObservableState(midgardService.pools.poolDetailedState$, RD.initial)

  return FP.pipe(
    detailedPoolData,
    RD.fold(
      renderInitialView,
      renderPendingView,
      (e: Error) => {
        return <PoolStatus label={intl.formatMessage({ id: 'common.error' })} displayValue={e.message} />
      },
      (data) => {
        return (
          <PoolDetails
            depth={getDepth(data, priceRatio)}
            volume24hr={get24hrVolume(data, priceRatio)}
            allTimeVolume={getAllTimeVolume(data, priceRatio)}
            totalSwaps={getTotalSwaps(data)}
            totalStakers={getTotalStakers(data)}
            returnToDate={getReturnToDate(data)}
            priceSymbol={O.toUndefined(priceSymbol)}
          />
        )
      }
    )
  )
}
