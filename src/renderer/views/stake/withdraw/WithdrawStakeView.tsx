import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRune67C, bn } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import { useObservableState, useSubscription } from 'observable-hooks'
import { map } from 'rxjs/operators'

import { Withdraw } from '../../../components/stake/withdraw'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
// import { useWalletContext } from '../../../contexts/WalletContext'
import { getDefaultRuneAsset } from '../../../helpers/assetHelper'
import { emptyFunc } from '../../../helpers/funcHelper'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as shareHelpers from '../../../helpers/poolShareHelper'
import { PoolDetailRD, StakersAssetDataRD } from '../../../services/midgard/types'
import { getPoolDetail } from '../../../services/midgard/utils'
import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard/models'

type Props = {
  stakedAsset: Asset
  runeAsset: Asset
}

export const WithdrawStakeView: React.FC<Props> = (props): JSX.Element => {
  const { stakedAsset, runeAsset } = props

  const {
    service: {
      pools: { poolDetail$, selectedPricePoolAsset$, priceRatio$, poolsState$ },
      stake: { getStakes$ }
    }
  } = useMidgardContext()

  const { withdrawFees$, reloadUnstakeFees, updateUnstakeFeesEffect$ } = useChainContext()

  useSubscription(updateUnstakeFeesEffect$)

  const fees = useObservableState(withdrawFees$, RD.initial)

  const runePrice = useObservableState(priceRatio$, bn(1))

  const poolsStateRD = useObservableState(poolsState$, RD.initial)
  /**
   * We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/stake.ts
   */

  const [stakeData] = useObservableState<StakersAssetDataRD>(getStakes$, RD.initial)

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)

  const [priceAssetRD]: [RD.RemoteData<Error, Asset>, unknown] = useObservableState(
    () =>
      FP.pipe(
        selectedPricePoolAsset$,
        map((asset) => RD.fromOption(asset, () => Error(''))),
        // In case there is no asset for any reason set basic RUNE asset as alt value
        map(RD.alt((): RD.RemoteData<Error, Asset> => RD.success(getDefaultRuneAsset())))
      ),
    RD.initial
  )

  const poolsState = FP.pipe(
    poolsStateRD,
    RD.chain((poolsState) => RD.fromOption(getPoolDetail(poolsState.poolDetails, stakedAsset), () => Error('no data')))
  )

  const assetPriceRD = FP.pipe(
    poolsState,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runePrice))
  )

  const renderEmptyForm = useCallback(
    () => (
      <Withdraw
        fee={fees}
        assetPrice={ZERO_BN}
        runePrice={runePrice}
        selectedCurrencyAsset={AssetRune67C}
        onWithdraw={emptyFunc}
        runeShare={ZERO_BASE_AMOUNT}
        assetShare={ZERO_BASE_AMOUNT}
        runeAsset={runeAsset}
        stakedAsset={stakedAsset}
        updateFees={reloadUnstakeFees}
        disabled
      />
    ),
    [fees, runePrice, runeAsset, stakedAsset, reloadUnstakeFees]
  )

  const renderWithdrawReady = useCallback(
    ([assetPrice, stake, poolDetail, priceAsset]: [BigNumber, StakersAssetData, PoolDetail, Asset]) => (
      <Withdraw
        assetPrice={assetPrice}
        runePrice={runePrice}
        selectedCurrencyAsset={priceAsset}
        onWithdraw={console.log}
        runeShare={shareHelpers.getRuneShare(stake, poolDetail)}
        assetShare={shareHelpers.getAssetShare(stake, poolDetail)}
        runeAsset={runeAsset}
        stakedAsset={stakedAsset}
        fee={fees}
        updateFees={reloadUnstakeFees}
      />
    ),
    [runePrice, runeAsset, stakedAsset, fees, reloadUnstakeFees]
  )

  return FP.pipe(
    RD.combine(assetPriceRD, stakeData, poolDetailRD, priceAssetRD),
    RD.fold(renderEmptyForm, renderEmptyForm, renderEmptyForm, renderWithdrawReady)
  )
}
