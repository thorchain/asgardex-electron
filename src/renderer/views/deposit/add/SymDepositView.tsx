import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, assetToString, BaseAmount, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { SymDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { ZERO_BN, ZERO_POOL_DATA } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as depositRoutes from '../../../routes/deposit'
import { SymDepositMemo } from '../../../services/chain/types'
import { PoolAddress, PoolAssetsRD, PoolDetailRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { getBalanceByAsset } from '../../../services/wallet/util'

type Props = {
  asset: Asset
}

export const SymDepositView: React.FC<Props> = ({ asset }) => {
  const history = useHistory()
  const intl = useIntl()

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(depositRoutes.deposit.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const {
    service: {
      pools: { availableAssets$, priceRatio$, selectedPricePoolAsset$, poolDetail$, selectedPoolAddress$ }
    }
  } = useMidgardContext()

  const { depositFees$, symDeposit$, reloadDepositFees, symDepositTxMemo$, getExplorerUrlByAsset$ } = useChainContext()

  const [depositFees] = useObservableState(() => depositFees$('sym'), RD.initial)
  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const {
    balancesState$,
    reloadBalances,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

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
      FP.pipe(
        balances,
        O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
        O.map(({ amount }) => amount)
      ),
    [asset, balances]
  )

  const depositTxMemo: O.Option<SymDepositMemo> = useObservableState(symDepositTxMemo$, O.none)

  const poolAssetsRD: PoolAssetsRD = useObservableState(availableAssets$, RD.initial)

  const assetPriceRD: RD.RemoteData<Error, BigNumber> = FP.pipe(
    poolDetailRD,
    // convert from RUNE price to selected pool asset price
    RD.map(getAssetPoolPrice(runPrice))
  )

  const getAssetExplorerUrl$ = useMemo(() => getExplorerUrlByAsset$(asset), [asset, getExplorerUrlByAsset$])
  const assetExplorerUrl = useObservableState(getAssetExplorerUrl$, O.none)

  const viewAssetTx = useCallback(
    (txHash: string) => {
      FP.pipe(
        assetExplorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [assetExplorerUrl]
  )

  const getRuneExplorerUrl$ = useMemo(() => getExplorerUrlByAsset$(AssetRuneNative), [getExplorerUrlByAsset$])
  const runeExplorerUrl = useObservableState(getRuneExplorerUrl$, O.none)

  const viewRuneTx = useCallback(
    (txHash: string) => {
      FP.pipe(
        runeExplorerUrl,
        O.map((getExplorerUrl) => window.apiUrl.openExternal(getExplorerUrl(txHash)))
      )
    },
    [runeExplorerUrl]
  )

  const renderDisabledAddDeposit = useCallback(
    (error?: Error) => (
      <>
        {error && (
          <Alert type="error" message={intl.formatMessage({ id: 'common.error' })} description={error.toString()} />
        )}
        <SymDeposit
          validatePassword$={validatePassword$}
          viewRuneTx={viewRuneTx}
          viewAssetTx={viewAssetTx}
          onChangeAsset={FP.constVoid}
          asset={asset}
          assetPrice={ZERO_BN}
          runePrice={ZERO_BN}
          assetBalance={O.none}
          runeBalance={O.none}
          chainAssetBalance={O.none}
          fees={depositFees}
          reloadFees={FP.constVoid}
          priceAsset={selectedPricePoolAsset}
          disabled={true}
          poolAddress={O.none}
          memo={O.none}
          reloadBalances={reloadBalances}
          poolData={ZERO_POOL_DATA}
          deposit$={symDeposit$}
        />
      </>
    ),
    [
      validatePassword$,
      viewRuneTx,
      viewAssetTx,
      asset,
      depositFees,
      selectedPricePoolAsset,
      reloadBalances,
      symDeposit$,
      intl
    ]
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
            <SymDeposit
              validatePassword$={validatePassword$}
              viewRuneTx={viewRuneTx}
              viewAssetTx={viewAssetTx}
              poolData={toPoolData(poolDetail)}
              onChangeAsset={onChangeAsset}
              asset={asset}
              assetPrice={assetPrice}
              runePrice={runPrice}
              assetBalance={assetBalance}
              runeBalance={runeBalance}
              chainAssetBalance={chainAssetBalance}
              poolAddress={oPoolAddress}
              memo={depositTxMemo}
              fees={depositFees}
              reloadFees={reloadDepositFees}
              priceAsset={selectedPricePoolAsset}
              reloadBalances={reloadBalances}
              assets={poolAssets}
              deposit$={symDeposit$}
            />
          </>
        )
      }
    )
  )
}
