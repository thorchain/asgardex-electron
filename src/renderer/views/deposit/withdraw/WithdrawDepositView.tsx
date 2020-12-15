import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { PoolData } from '@thorchain/asgardex-util'
import { Asset, AssetRune67C, AssetRuneNative, BaseAmount, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { map } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { Withdraw } from '../../../components/deposit/withdraw'
import { ZERO_BASE_AMOUNT, ZERO_BN, ZERO_POOL_DATA } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { emptyFunc } from '../../../helpers/funcHelper'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as shareHelpers from '../../../helpers/poolShareHelper'
import { PoolDetailRD, StakersAssetDataRD } from '../../../services/midgard/types'
import { getPoolDetail, toPoolData } from '../../../services/midgard/utils'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard/models'

type Props = {
  asset: Asset
}

export const WithdrawDepositView: React.FC<Props> = (props): JSX.Element => {
  const { asset } = props
  const {
    service: {
      pools: { poolDetail$, selectedPricePoolAsset$, priceRatio$, poolsState$ },
      stake: { getStakes$ }
    }
  } = useMidgardContext()

  const { withdrawFees$, reloadWithdrawFees } = useChainContext()

  const fees = useObservableState(withdrawFees$, RD.initial)

  const runePrice = useObservableState(priceRatio$, bn(1))

  const poolsStateRD = useObservableState(poolsState$, RD.initial)
  /**
   * We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/stake.ts
   */

  const [depositData] = useObservableState<StakersAssetDataRD>(getStakes$, RD.initial)

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)

  const [selectedPriceAssetRD]: [RD.RemoteData<Error, Asset>, unknown] = useObservableState(
    () =>
      FP.pipe(
        selectedPricePoolAsset$,
        map((asset) => RD.fromOption(asset, () => Error(''))),
        // In case there is no asset for any reason set basic RUNE asset as alt value
        map(RD.alt((): RD.RemoteData<Error, Asset> => RD.success(AssetRuneNative)))
      ),
    RD.initial
  )

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolDetailRD,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runePrice))
  )

  const chainAssetPoolDataRD: RD.RemoteData<Error, PoolData> = FP.pipe(
    poolsStateRD,
    // get `PoolDetail` of `asset.chain` asset
    RD.chain((poolsState) =>
      RD.fromOption(getPoolDetail(poolsState.poolDetails, getChainAsset(asset.chain)), () => Error('no data'))
    ),
    // convert from RUNE price to selected pool asset price
    RD.map(toPoolData)
  )

  const assetPoolDataRD: RD.RemoteData<Error, PoolData> = FP.pipe(poolDetailRD, RD.map(toPoolData))

  const { balancesState$ } = useWalletContext()

  const [balances] = useObservableState(
    () =>
      FP.pipe(
        balancesState$,
        RxOp.map((state) => state.balances)
      ),
    O.none
  )

  const runeBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        balances,
        O.chain(getBalanceByAsset(AssetRuneNative)),
        O.map(({ amount }) => amount)
      ),
    [balances]
  )

  const renderEmptyForm = useCallback(
    () => (
      <Withdraw
        // currently we support sym withdraw only - asym will be added later
        type={'sym'}
        fees={fees}
        assetPrice={ZERO_BN}
        assetPoolData={ZERO_POOL_DATA}
        runePrice={runePrice}
        chainAssetPoolData={ZERO_POOL_DATA}
        runeBalance={runeBalance}
        selectedPriceAsset={AssetRune67C}
        onWithdraw={emptyFunc}
        runeShare={ZERO_BASE_AMOUNT}
        assetShare={ZERO_BASE_AMOUNT}
        asset={asset}
        reloadFees={reloadWithdrawFees}
        disabled
      />
    ),
    [fees, runePrice, runeBalance, asset, reloadWithdrawFees]
  )

  const renderWithdrawReady = useCallback(
    ([assetPrice, depositData, poolDetail, selectedPriceAsset, assetPoolData, chainAssetPoolData]: [
      BigNumber,
      StakersAssetData,
      PoolDetail,
      Asset,
      PoolData,
      PoolData
    ]) => (
      <Withdraw
        // currently we support sym withdraw only - asym will be added later
        type={'sym'}
        assetPrice={assetPrice}
        assetPoolData={assetPoolData}
        runePrice={runePrice}
        chainAssetPoolData={chainAssetPoolData}
        runeBalance={runeBalance}
        selectedPriceAsset={selectedPriceAsset}
        onWithdraw={console.log}
        runeShare={shareHelpers.getRuneShare(depositData, poolDetail)}
        assetShare={shareHelpers.getAssetShare(depositData, poolDetail)}
        asset={asset}
        fees={fees}
        reloadFees={reloadWithdrawFees}
      />
    ),
    [runePrice, runeBalance, asset, fees, reloadWithdrawFees]
  )

  return FP.pipe(
    RD.combine(assetPriceRD, depositData, poolDetailRD, selectedPriceAssetRD, assetPoolDataRD, chainAssetPoolDataRD),
    RD.fold(renderEmptyForm, renderEmptyForm, renderEmptyForm, renderWithdrawReady)
  )
}
