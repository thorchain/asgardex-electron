import React, { useCallback, useMemo, useRef } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { Asset, assetFromString, bnOrZero } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { PoolShares } from '../../components/PoolShares'
import { PoolShare } from '../../components/PoolShares/types'
import { ErrorView } from '../../components/shared/error'
import { Button } from '../../components/uielements/button'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import * as shareHelpers from '../../helpers/poolShareHelper'
import { PoolDetails, StakersAssetData, StakersDataLD, StakersDataRD } from '../../services/midgard/types'
import { toPoolData } from '../../services/midgard/utils'

export const PoolShareView: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, selectedPricePool$, selectedPricePoolAsset$, reloadPools },
    reloadNetworkInfo,
    stake: { getAllStakes$ }
  } = midgardService

  const thorchainContext = useThorchainContext()
  const oRuneAddress = useObservableState(thorchainContext.address$, O.none)
  const bitcoinContext = useBitcoinContext()
  const oBitcoinAddress = useObservableState(bitcoinContext.address$, O.none)
  const binanceContext = useBinanceContext()
  const oBinanceAddress = useObservableState(binanceContext.address$, O.none)
  /**
   * We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/stake.ts
   */
  const bitcoinStakeData$: StakersDataLD = useMemo(
    () =>
      FP.pipe(
        oBitcoinAddress,
        O.fold(
          () => Rx.EMPTY,
          (address) => getAllStakes$(address)
        )
      ),
    [getAllStakes$, oBitcoinAddress]
  )
  const bitcoinStakeData = useObservableState<StakersDataRD>(bitcoinStakeData$, RD.initial)

  const binanceStakeData$: StakersDataLD = useMemo(
    () =>
      FP.pipe(
        oBinanceAddress,
        O.fold(
          () => Rx.EMPTY,
          (address) => getAllStakes$(address)
        )
      ),
    [getAllStakes$, oBinanceAddress]
  )
  const binanceStakeData = useObservableState<StakersDataRD>(binanceStakeData$, RD.initial)

  const poolsRD = useObservableState(poolsState$, RD.pending)
  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)
  const priceAsset = FP.pipe(oPriceAsset, O.toUndefined)

  // store previous data of pools to render these while reloading
  const previousPoolShares = useRef<O.Option<PoolShare[]>>(O.none)

  const goToStakeInfo = useCallback(() => {
    FP.pipe(
      oRuneAddress,
      O.map((address) => window.apiUrl.openExternal(`https://runestake.info/home?address=${address}`))
    )
  }, [oRuneAddress])

  const getPoolSharesData = useCallback(
    (stakes: StakersAssetData[], poolsData: PoolDetails) => {
      const data: PoolShare[] = []
      poolsData.forEach((pool) => {
        const stake = stakes
          .filter((stake) => stake.asset === pool.asset)
          .reduce(
            (a, b) => ({
              units: bnOrZero(a.units).plus(bnOrZero(b.units)).toString()
            }),
            {}
          )
        const asset = assetFromString(pool.asset)
        if (asset && stake.units) {
          const runeShare = shareHelpers.getRuneShare(stake, pool)
          const assetShare = shareHelpers.getAssetShare(stake, pool)
          const poolShare = shareHelpers.getPoolShare(stake, pool)
          const poolData = toPoolData(pool)
          const assetDepositPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
          const runeDepositPrice = getValueOfRuneInAsset(runeShare, pricePoolData)

          data.push({
            asset,
            poolShare,
            assetDepositPrice,
            runeDepositPrice
          })
        }
      })

      return data
    },
    [pricePoolData]
  )

  const renderPoolSharesTable = useCallback(
    (data: PoolShare[]) => {
      previousPoolShares.current = O.some(data)
      return <PoolShares data={data} priceAsset={priceAsset} goToStakeInfo={goToStakeInfo} />
    },
    [goToStakeInfo, priceAsset]
  )

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
        RD.combine(bitcoinStakeData, binanceStakeData, poolsRD),
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
          ([bitcoinStakes, binanceStakes, pools]) => {
            const data = getPoolSharesData([...bitcoinStakes, ...binanceStakes], pools.poolDetails)
            previousPoolShares.current = O.some(data)
            return renderPoolSharesTable(data)
          }
        )
      ),
    [bitcoinStakeData, binanceStakeData, poolsRD, renderPoolSharesTable, renderRefreshBtn, getPoolSharesData]
  )

  return renderPoolShares
}
