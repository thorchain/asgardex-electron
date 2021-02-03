import React, { useCallback, useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import {
  Asset,
  assetFromString,
  baseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  formatBN
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { PoolShares } from '../../components/PoolShares'
import { PoolShare } from '../../components/PoolShares/types'
import { ErrorView } from '../../components/shared/error'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import * as shareHelpers from '../../helpers/poolShareHelper'
import { PoolDetails, StakersAssetData, StakersAssetDataRD } from '../../services/midgard/types'
import { toPoolData } from '../../services/midgard/utils'

export const PoolShareView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, selectedPricePool$, selectedPricePoolAsset$, reloadPools },
    reloadNetworkInfo,
    stake: { getStakes$ }
  } = midgardService

  const poolsRD = useObservableState(poolsState$, RD.pending)
  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)
  const priceAsset = FP.pipe(oPriceAsset, O.toUndefined)
  const [stakeData] = useObservableState<StakersAssetDataRD>(getStakes$, RD.initial)

  // store previous data of pools to render these while reloading
  const previousPoolShares = useRef<O.Option<PoolShare[]>>(O.none)

  const goToStakeInfo = (asset: Asset) => {
    console.log(asset)
  }

  const goToDataInfo = (asset: Asset) => {
    console.log(asset)
  }

  const getPoolSharesData = useCallback(
    (stake: StakersAssetData, poolsData: PoolDetails) => {
      const data: PoolShare[] = []
      poolsData.forEach((pool) => {
        const asset = assetFromString(pool.asset)
        if (asset) {
          const runeShare = shareHelpers.getRuneShare(stake, pool)
          const assetShare = shareHelpers.getAssetShare(stake, pool)
          const poolShare = shareHelpers.getPoolShare(stake, pool)
          const poolData = toPoolData(pool)
          const assetDepositPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
          const runeDepositPrice = getValueOfRuneInAsset(runeShare, pricePoolData)
          const totalPrice = baseAmount(runeDepositPrice.amount().plus(assetDepositPrice.amount()))

          data.push({
            asset,
            ownership: formatBN(poolShare),
            value: formatAssetAmountCurrency({ amount: baseToAsset(totalPrice), asset: priceAsset, decimal: 2 })
          })
        }
      })

      return data
    },
    [priceAsset, pricePoolData]
  )

  const renderPoolSharesTable = useCallback((data: PoolShare[]) => {
    previousPoolShares.current = O.some(data)
    return <PoolShares data={data} goToStakeInfo={goToStakeInfo} goToDataInfo={goToDataInfo} />
  }, [])

  const clickRefreshHandler = useCallback(() => {
    reloadPools()
    reloadNetworkInfo()
  }, [reloadNetworkInfo, reloadPools])

  const renderRefreshBtn = useMemo(
    () => (
      <Button onClick={clickRefreshHandler} typevalue="outline">
        <SyncOutlined />
        {intl.formatMessage({ id: 'common.refresh' })}
      </Button>
    ),
    [clickRefreshHandler, intl]
  )

  const renderPoolShares = useMemo(
    () =>
      FP.pipe(
        RD.combine(stakeData, poolsRD),
        RD.fold(
          // initial state
          () => renderPoolSharesTable([]),
          // loading state
          () => {
            const data = O.getOrElse(() => [] as PoolShare[])(previousPoolShares.current)
            return renderPoolSharesTable(data)
          },
          // error state
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} extra={renderRefreshBtn} />
          },
          // success state
          ([stake, pools]) => {
            const data = getPoolSharesData(stake, pools.poolDetails)
            previousPoolShares.current = O.some(data)
            return renderPoolSharesTable(data)
          }
        )
      ),
    [stakeData, poolsRD, renderPoolSharesTable, renderRefreshBtn, getPoolSharesData]
  )

  return renderPoolShares
}
