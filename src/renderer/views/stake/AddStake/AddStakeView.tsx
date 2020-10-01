import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, baseAmount, bn, bnOrZero } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router'
import { map } from 'rxjs/operators'

import { AddStake } from '../../../components/stake/AddStake/AddStake'
import { ONE_ASSET_BASE_AMOUNT, ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getDefaultRuneAsset } from '../../../helpers/assetHelper'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { liveData } from '../../../helpers/rx/liveData'
import * as stakeRoutes from '../../../routes/stake'
import { PoolDetailRD, StakersAssetDataRD } from '../../../services/midgard/types'
import { getPoolDetail } from '../../../services/midgard/utils'
import { getBalanceByAsset } from '../../../services/wallet/util'

export const AddStakeView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const history = useHistory()

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(stakeRoutes.stake.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const { service } = useMidgardContext()
  const { assetsWBState$ } = useWalletContext()

  const runeAsset = useObservableState(service.pools.runeAsset$, getDefaultRuneAsset(asset.chain))
  const runPrice = useObservableState(service.pools.priceRatio$, bn(1))
  const selectedPricePoolAssetSymbol = useObservableState(service.pools.selectedPricePoolAssetSymbol$, O.none)
  /* We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/stake.ts
   */
  const stakeData$ = useMemo(() => service.stake.getStakes$(asset), [asset, service.stake])
  const stakeData = useObservableState<StakersAssetDataRD>(stakeData$, RD.initial)

  const {
    pools: { poolDetailedState$, selectedPricePoolAssetSymbol$, priceRatio$ }
  } = service

  const [assetsWB] = useObservableState(
    () =>
      FP.pipe(
        assetsWBState$,
        map((assetsWBState) => assetsWBState.assetsWB)
      ),
    O.none
  )

  const poolDetailedInfo = useObservableState<PoolDetailRD>(poolDetailedState$, RD.initial)

  const assetBalance = FP.pipe(
    assetsWB,
    O.chain(getBalanceByAsset(asset)),
    O.map((assetWithAmount) => {
      return assetWithAmount.amount
    }),
    O.getOrElse(() => ZERO_BASE_AMOUNT)
  )

  const runeBalance = FP.pipe(
    assetsWB,
    O.chain(getBalanceByAsset(runeAsset)),
    O.map((assetWithAmount) => assetWithAmount.amount),
    O.getOrElse(() => ZERO_BASE_AMOUNT)
  )

  const poolsStateRD = useObservableState(service.pools.poolsState$, RD.initial)

  const poolsState = FP.pipe(
    poolsStateRD,
    RD.chain((poolsState) => RD.fromOption(getPoolDetail(poolsState.poolDetails, asset), () => Error('no data')))
  )

  const [poolAssets] = useObservableState(
    () =>
      FP.pipe(
        service.pools.availableAssets$,
        liveData.map(
          A.map((asset) => ({
            asset,
            price: ONE_ASSET_BASE_AMOUNT
          }))
        )
      ),
    RD.initial
  )

  const assetPrice = FP.pipe(
    poolsState,
    // convert from RUNE price to selected pool asset price
    RD.map((state) => bnOrZero(state.price).multipliedBy(runPrice))
  )

  const renderDisabledAddStake = useCallback(
    () => (
      <AddStake
        onChangeAsset={() => {}}
        asset={asset}
        runeAsset={runeAsset}
        assetPrice={ZERO_BN}
        runePrice={ZERO_BN}
        assetAmount={ZERO_BASE_AMOUNT}
        runeAmount={ZERO_BASE_AMOUNT}
        onStake={() => {}}
        unit={O.toUndefined(selectedPricePoolAssetSymbol)}
        disabled={true}
      />
    ),
    [asset, runeAsset, selectedPricePoolAssetSymbol]
  )

  return FP.pipe(
    sequenceTRD(assetPrice, poolAssets, stakeData, poolDetailedInfo),
    RD.fold(
      renderDisabledAddStake,
      renderDisabledAddStake,
      renderDisabledAddStake,
      ([assetPrice, poolAssets, stake, pool]) => {
        return (
          <AddStake
            onChangeAsset={onChangeAsset}
            asset={asset}
            runeAsset={runeAsset}
            assetPrice={assetPrice}
            runePrice={runPrice}
            assetAmount={baseAmount(bnOrZero(pool.assetDepth))}
            runeAmount={baseAmount(bnOrZero(pool.runeDepth))}
            onStake={console.log}
            unit={O.toUndefined(selectedPricePoolAssetSymbol)}
            assetData={poolAssets}
          />
        )
      }
    )
  )
}
