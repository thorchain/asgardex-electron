import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount, baseToAsset, bn, bnOrZero } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import { Option, some } from 'fp-ts/Option'
import { pipe } from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'

import { PoolDetails } from '../../../components/stake/PoolDetails/PoolDetails'
import { ONE_BN } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { PoolDetail } from '../../../types/generated/midgard/models'
import { PricePoolAsset } from '../../pools/types'

const getDepth = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const get24hrVolume = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.poolVolume24hr).multipliedBy(priceRatio)))

const getAllTimeVolume = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.poolVolume).multipliedBy(priceRatio)))

const getTotalSwaps = (data: PoolDetail) => Number(data.swappingTxCount || 0)

const getTotalStakers = (data: PoolDetail) => Number(data.stakersCount || 0)

const getReturnToDate = (data: PoolDetail) => (parseFloat(data.poolROI || '0') * 100).toFixed(2)

type Props = {}

export const PoolDetailsView: React.FC<Props> = () => {
  const { service: midgardService } = useMidgardContext()

  const selectedPricePoolAsset = useObservableState<Option<PricePoolAsset>>(
    midgardService.pools.selectedPricePoolAsset$,
    some(midgardService.pools.getDefaultRuneAsset())
  )

  const priceRatio = useObservableState(midgardService.pools.priceRatio$, ONE_BN)

  const detailedPoolData = useObservableState(midgardService.pools.poolDetailedState$, RD.initial)

  return pipe(
    detailedPoolData,
    RD.fold(
      () => null,
      () => null,
      () => null,
      (data) => {
        return (
          <PoolDetails
            depth={getDepth(data, priceRatio)}
            volume24hr={get24hrVolume(data, priceRatio)}
            allTimeVolume={getAllTimeVolume(data, priceRatio)}
            totalSwaps={getTotalSwaps(data)}
            totalStakers={getTotalStakers(data)}
            returnToDate={getReturnToDate(data)}
            basePriceAsset={pipe(
              selectedPricePoolAsset,
              O.getOrElse(() => midgardService.pools.getDefaultRuneAsset() as PricePoolAsset)
            )}
          />
        )
      }
    )
  )
}
