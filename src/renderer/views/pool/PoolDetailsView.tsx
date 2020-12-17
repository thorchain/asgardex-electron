import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { baseAmount, baseToAsset, bn, bnOrZero } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { PoolDetails, Props as PoolDetailProps } from '../../components/pool/PoolDetails'
import { PoolStatus } from '../../components/uielements/poolStatus'
import { ZERO_ASSET_AMOUNT, ONE_BN } from '../../const'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { PoolDetail } from '../../services/midgard/types'

const getDepth = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.runeDepth).multipliedBy(priceRatio)))

const get24hrVolume = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(data.volume24h).multipliedBy(priceRatio)))

const getAllTimeVolume = (data: PoolDetail, priceRatio: BigNumber = bn(1)) =>
  baseToAsset(baseAmount(bnOrZero(/*data.poolVolume*/ 0).multipliedBy(priceRatio)))

const getTotalSwaps = (data: PoolDetail) => Number(data.swappingTxCount)

const getTotalStakers = (_data: PoolDetail) => Number(/*data.stakersCount ||*/ 0)

const defaultDetailsProps: PoolDetailProps = {
  depth: ZERO_ASSET_AMOUNT,
  volume24hr: ZERO_ASSET_AMOUNT,
  allTimeVolume: ZERO_ASSET_AMOUNT,
  totalSwaps: 0,
  totalStakers: 0
}

const renderPendingView = () => <PoolDetails {...defaultDetailsProps} isLoading={true} />
const renderInitialView = () => <PoolDetails {...defaultDetailsProps} />

export const PoolDetailsView: React.FC = () => {
  const {
    service: {
      pools: { poolDetail$, priceRatio$, selectedPricePoolAssetSymbol$ }
    }
  } = useMidgardContext()

  const intl = useIntl()

  const priceSymbol = useObservableState(selectedPricePoolAssetSymbol$, O.none)

  const priceRatio = useObservableState(priceRatio$, ONE_BN)

  const poolDetailRD = useObservableState(poolDetail$, RD.initial)

  return FP.pipe(
    poolDetailRD,
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
            priceSymbol={O.toUndefined(priceSymbol)}
          />
        )
      }
    )
  )
}
