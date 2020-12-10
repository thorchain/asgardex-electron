import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRune67C, AssetRuneNative, BaseAmount, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { map } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { Withdraw } from '../../../components/deposit/withdraw'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { emptyFunc } from '../../../helpers/funcHelper'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as shareHelpers from '../../../helpers/poolShareHelper'
import { PoolDetailRD, StakersAssetDataRD } from '../../../services/midgard/types'
import { getPoolDetail } from '../../../services/midgard/utils'
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

  const [priceAssetRD]: [RD.RemoteData<Error, Asset>, unknown] = useObservableState(
    () =>
      FP.pipe(
        selectedPricePoolAsset$,
        map((asset) => RD.fromOption(asset, () => Error(''))),
        // In case there is no asset for any reason set basic RUNE asset as alt value
        map(RD.alt((): RD.RemoteData<Error, Asset> => RD.success(AssetRuneNative)))
      ),
    RD.initial
  )

  const poolsState = FP.pipe(
    poolsStateRD,
    RD.chain((poolsState) => RD.fromOption(getPoolDetail(poolsState.poolDetails, asset), () => Error('no data')))
  )

  const assetPriceRD = FP.pipe(
    poolsState,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runePrice))
  )

  const { balancesState$ } = useWalletContext()

  const [balances] = useObservableState(
    () =>
      FP.pipe(
        balancesState$,
        RxOp.map((state) => state.balances)
      ),
    O.none
  )

  const chainAssetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        balances,
        O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
        O.map(({ amount }) => amount)
      ),
    [asset, balances]
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
        runePrice={runePrice}
        chainAssetBalance={chainAssetBalance}
        runeBalance={runeBalance}
        selectedCurrencyAsset={AssetRune67C}
        onWithdraw={emptyFunc}
        runeShare={ZERO_BASE_AMOUNT}
        assetShare={ZERO_BASE_AMOUNT}
        asset={asset}
        updateFees={reloadWithdrawFees}
        disabled
      />
    ),
    [fees, runePrice, chainAssetBalance, runeBalance, asset, reloadWithdrawFees]
  )

  const renderWithdrawReady = useCallback(
    ([assetPrice, deposit, poolDetail, priceAsset]: [BigNumber, StakersAssetData, PoolDetail, Asset]) => (
      <Withdraw
        // currently we support sym withdraw only - asym will be added later
        type={'sym'}
        assetPrice={assetPrice}
        runePrice={runePrice}
        chainAssetBalance={chainAssetBalance}
        runeBalance={runeBalance}
        selectedCurrencyAsset={priceAsset}
        onWithdraw={console.log}
        runeShare={shareHelpers.getRuneShare(deposit, poolDetail)}
        assetShare={shareHelpers.getAssetShare(deposit, poolDetail)}
        asset={asset}
        fees={fees}
        updateFees={reloadWithdrawFees}
      />
    ),
    [runePrice, chainAssetBalance, runeBalance, asset, fees, reloadWithdrawFees]
  )

  return FP.pipe(
    RD.combine(assetPriceRD, depositData, poolDetailRD, priceAssetRD),
    RD.fold(renderEmptyForm, renderEmptyForm, renderEmptyForm, renderWithdrawReady)
  )
}
