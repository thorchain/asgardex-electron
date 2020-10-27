import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, BaseAmount, bn } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { AddStake } from '../../../components/stake/add'
import { BASE_CHAIN_ASSET, ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset, isBaseChainAsset, isCrossChainAsset } from '../../../helpers/chainHelper'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { emptyFunc } from '../../../helpers/funcHelper'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as stakeRoutes from '../../../routes/stake'
import { PoolDetailRD } from '../../../services/midgard/types'
import { getPoolDetail, toPoolData } from '../../../services/midgard/utils'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { StakeType } from '../../../types/asgardex'

type Props = {
  asset: Asset
  runeAsset: Asset
  type: StakeType
}

export const AddStakeView: React.FC<Props> = ({ asset, runeAsset, type = 'asym' }) => {
  const history = useHistory()

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(stakeRoutes.stake.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const {
    service: {
      pools: { availableAssets$, priceRatio$, selectedPricePoolAsset$, poolDetail$, poolsState$ }
    }
  } = useMidgardContext()

  const { stakeFees$, reloadStakeFees: reloadFees, isCrossChainStake$ } = useChainContext()
  const stakeFees = useObservableState(stakeFees$, RD.initial)
  const isCrossChain = useObservableState(isCrossChainStake$, false)

  const { assetsWBState$ } = useWalletContext()

  const runPrice = useObservableState(priceRatio$, bn(1))
  const [selectedPricePoolAsset] = useObservableState(() => FP.pipe(selectedPricePoolAsset$, RxOp.map(O.toUndefined)))

  const [assetsWB] = useObservableState(
    () =>
      FP.pipe(
        assetsWBState$,
        RxOp.map((assetsWBState) => assetsWBState.assetsWB)
      ),
    O.none
  )

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)

  const assetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        assetsWB,
        O.chain(getBalanceByAsset(asset)),
        O.map((assetWithAmount) => {
          return assetWithAmount.amount
        })
      ),
    [asset, assetsWB]
  )

  const runeBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        assetsWB,
        O.chain(getBalanceByAsset(runeAsset)),
        O.map((assetWithAmount) => assetWithAmount.amount)
      ),
    [assetsWB, runeAsset]
  )

  const baseChainAssetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      isBaseChainAsset(asset)
        ? assetBalance
        : FP.pipe(
            assetsWB,
            O.chain(getBalanceByAsset(BASE_CHAIN_ASSET)),
            O.map((assetWithAmount) => assetWithAmount.amount)
          ),
    [asset, assetBalance, assetsWB]
  )

  const crossChainAssetBalance: O.Option<BaseAmount> = useMemo(() => {
    if (!isCrossChain) return O.none

    return isCrossChainAsset(asset)
      ? assetBalance
      : FP.pipe(
          assetsWB,
          O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
          O.map((assetWithAmount) => assetWithAmount.amount)
        )
  }, [asset, assetBalance, assetsWB, isCrossChain])

  const poolsStateRD = useObservableState(poolsState$, RD.initial)

  const poolsState = FP.pipe(
    poolsStateRD,
    RD.chain((poolsState) => RD.fromOption(getPoolDetail(poolsState.poolDetails, asset), () => Error('no data')))
  )

  const poolAssetsRD = useObservableState(availableAssets$, RD.initial)

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolsState,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runPrice))
  )

  const renderDisabledAddStake = useCallback(
    () => (
      <AddStake
        type={type}
        onChangeAsset={emptyFunc}
        asset={asset}
        runeAsset={runeAsset}
        assetPrice={ZERO_BN}
        runePrice={ZERO_BN}
        assetBalance={O.none}
        runeBalance={O.none}
        baseChainAssetBalance={O.none}
        crossChainAssetBalance={O.none}
        onStake={emptyFunc}
        fees={stakeFees}
        reloadFees={emptyFunc}
        priceAsset={selectedPricePoolAsset}
        disabled={true}
        isCrossChain={isCrossChain}
        poolData={{ runeBalance: ZERO_BASE_AMOUNT, assetBalance: ZERO_BASE_AMOUNT }}
      />
    ),
    [asset, isCrossChain, runeAsset, selectedPricePoolAsset, stakeFees, type]
  )

  return FP.pipe(
    sequenceTRD(assetPriceRD, poolAssetsRD, poolDetailRD),
    RD.fold(
      renderDisabledAddStake,
      renderDisabledAddStake,
      renderDisabledAddStake,
      ([assetPrice, poolAssets, pool]) => {
        return (
          <>
            <AddStake
              type={type}
              poolData={toPoolData(pool)}
              onChangeAsset={onChangeAsset}
              asset={asset}
              runeAsset={runeAsset}
              assetPrice={assetPrice}
              runePrice={runPrice}
              assetBalance={assetBalance}
              runeBalance={runeBalance}
              baseChainAssetBalance={baseChainAssetBalance}
              crossChainAssetBalance={crossChainAssetBalance}
              isCrossChain={isCrossChain}
              onStake={console.log}
              fees={stakeFees}
              reloadFees={reloadFees}
              priceAsset={selectedPricePoolAsset}
              assets={poolAssets}
            />
          </>
        )
      }
    )
  )
}
