import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, assetToString, BaseAmount, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState, useSubscription } from 'observable-hooks'
import { useHistory } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { AddDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { BASE_CHAIN_ASSET, ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset, isBaseChainAsset, isCrossChainAsset } from '../../../helpers/chainHelper'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { emptyFunc } from '../../../helpers/funcHelper'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as depositRoutes from '../../../routes/deposit'
import { SymDepositMemo, Memo } from '../../../services/chain/types'
import { PoolAddress, PoolAssetsRD, PoolDetailRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { DepositType } from '../../../types/asgardex'

type Props = {
  asset: Asset
  type: DepositType
}

export const AddDepositView: React.FC<Props> = ({ asset, type = 'asym' }) => {
  const history = useHistory()

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(depositRoutes.deposit.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const {
    service: {
      pools: { availableAssets$, priceRatio$, selectedPricePoolAsset$, poolDetail$, poolAddress$ }
    }
  } = useMidgardContext()

  const {
    depositFees$,
    reloadDepositFees,
    isCrossChainDeposit$,
    symDepositTxMemo$,
    asymDepositTxMemo$,
    updateDepositFeesEffect$
  } = useChainContext()

  // subscribe to
  useSubscription(updateDepositFeesEffect$)

  const [depositFees] = useObservableState(() => depositFees$(type), RD.initial)
  const oPoolAddress: O.Option<PoolAddress> = useObservableState(poolAddress$, O.none)
  const isCrossChain = useObservableState(isCrossChainDeposit$, false)

  const { balancesState$ } = useWalletContext()

  const runPrice = useObservableState(priceRatio$, bn(1))
  const [selectedPricePoolAsset] = useObservableState(() => FP.pipe(selectedPricePoolAsset$, RxOp.map(O.toUndefined)))

  const [balances] = useObservableState(
    () =>
      FP.pipe(
        balancesState$,
        RxOp.map((state) => state.balances)
      ),
    O.none
  )

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)

  const assetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        balances,
        O.chain(getBalanceByAsset(asset)),
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

  const chainAssetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      isBaseChainAsset(asset)
        ? assetBalance
        : FP.pipe(
            balances,
            O.chain(getBalanceByAsset(BASE_CHAIN_ASSET)),
            O.map(({ amount }) => amount)
          ),
    [asset, assetBalance, balances]
  )

  const crossChainAssetBalance: O.Option<BaseAmount> = useMemo(() => {
    if (!isCrossChain) return O.none

    return isCrossChainAsset(asset)
      ? assetBalance
      : FP.pipe(
          balances,
          O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
          O.map((assetWithAmount) => assetWithAmount.amount)
        )
  }, [asset, assetBalance, balances, isCrossChain])

  const symDepositTxMemo: O.Option<SymDepositMemo> = useObservableState(symDepositTxMemo$, O.none)

  const asymDepositTxMemo: O.Option<Memo> = useObservableState(asymDepositTxMemo$, O.none)

  const poolAssetsRD: PoolAssetsRD = useObservableState(availableAssets$, RD.initial)

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolDetailRD,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runPrice))
  )

  const renderDisabledAddDeposit = useCallback(
    (error?: Error) => (
      <>
        {/* TODO (@Veado) i18n */}
        {error && <Alert type="error" message="Something went wrong" description={error.toString()} />}
        <AddDeposit
          type={type}
          onChangeAsset={emptyFunc}
          asset={asset}
          assetPrice={ZERO_BN}
          runePrice={ZERO_BN}
          assetBalance={O.none}
          runeBalance={O.none}
          baseChainAssetBalance={O.none}
          crossChainAssetBalance={O.none}
          onDeposit={emptyFunc}
          fees={depositFees}
          reloadFees={emptyFunc}
          priceAsset={selectedPricePoolAsset}
          disabled={true}
          isCrossChain={isCrossChain}
          poolAddress={O.none}
          symDepositMemo={O.none}
          asymDepositMemo={O.none}
          poolData={{ runeBalance: ZERO_BASE_AMOUNT, assetBalance: ZERO_BASE_AMOUNT }}
        />
      </>
    ),
    [asset, isCrossChain, selectedPricePoolAsset, depositFees, type]
  )

  return FP.pipe(
    sequenceTRD(assetPriceRD, poolAssetsRD, poolDetailRD),
    RD.fold(
      renderDisabledAddDeposit,
      (_) => renderDisabledAddDeposit(),
      (error) => renderDisabledAddDeposit(error),
      ([assetPrice, poolAssets, poolDetail]) => {
        return (
          <>
            <AddDeposit
              type={type}
              poolData={toPoolData(poolDetail)}
              onChangeAsset={onChangeAsset}
              asset={asset}
              assetPrice={assetPrice}
              runePrice={runPrice}
              assetBalance={assetBalance}
              runeBalance={runeBalance}
              baseChainAssetBalance={chainAssetBalance}
              crossChainAssetBalance={crossChainAssetBalance}
              isCrossChain={isCrossChain}
              poolAddress={oPoolAddress}
              symDepositMemo={symDepositTxMemo}
              asymDepositMemo={asymDepositTxMemo}
              onDeposit={console.log}
              fees={depositFees}
              reloadFees={reloadDepositFees}
              priceAsset={selectedPricePoolAsset}
              assets={poolAssets}
            />
          </>
        )
      }
    )
  )
}
