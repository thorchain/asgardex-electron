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

import { Network } from '../../../../shared/api/types'
import { SymDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { ZERO_BN, ZERO_POOL_DATA } from '../../../const'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useEthereumContext } from '../../../contexts/EthereumContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import { filterWalletBalancesByAssets } from '../../../helpers/walletHelper'
import * as poolsRoutes from '../../../routes/pools'
import { SymDepositMemo } from '../../../services/chain/types'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolAddress, PoolAssetsRD, PoolDetailRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { AssetWithDecimal } from '../../../types/asgardex'
import { WalletBalances } from '../../../types/wallet'

type Props = {
  asset: AssetWithDecimal
}

export const SymDepositView: React.FC<Props> = (props) => {
  const { asset: assetWD } = props
  const { asset } = assetWD
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(poolsRoutes.deposit.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const {
    service: {
      pools: {
        availableAssets$,
        priceRatio$,
        selectedPricePoolAsset$,
        selectedPoolDetail$,
        reloadSelectedPoolDetail,
        selectedPoolAddress$
      },
      shares: { reloadShares }
    }
  } = useMidgardContext()

  const {
    symDepositFees$,
    symDeposit$,
    reloadSymDepositFees,
    symDepositTxMemo$,
    getExplorerUrlByAsset$
  } = useChainContext()

  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const {
    balancesState$,
    reloadBalances,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const { approveERC20Token$, isApprovedERC20Token$ } = useEthereumContext()

  const runPrice = useObservableState(priceRatio$, bn(1))
  const [selectedPricePoolAsset] = useObservableState(() => FP.pipe(selectedPricePoolAsset$, RxOp.map(O.toUndefined)))

  const { balances: walletBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const poolDetailRD = useObservableState<PoolDetailRD>(selectedPoolDetail$, RD.initial)

  const assetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(asset)),
        O.map(({ amount }) => amount)
      ),
    [asset, walletBalances]
  )

  const runeBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(AssetRuneNative)),
        O.map(({ amount }) => amount)
      ),
    [walletBalances]
  )

  const chainAssetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(getChainAsset(asset.chain))),
        O.map(({ amount }) => amount)
      ),
    [asset, walletBalances]
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
          asset={assetWD}
          assetPrice={ZERO_BN}
          runePrice={ZERO_BN}
          assetBalance={O.none}
          runeBalance={O.none}
          chainAssetBalance={O.none}
          fees$={symDepositFees$}
          reloadFees={FP.constVoid}
          priceAsset={selectedPricePoolAsset}
          disabled={true}
          poolAddress={O.none}
          memos={O.none}
          reloadBalances={reloadBalances}
          reloadShares={reloadShares}
          reloadSelectedPoolDetail={reloadSelectedPoolDetail}
          poolData={ZERO_POOL_DATA}
          deposit$={symDeposit$}
          network={network}
          approveERC20Token$={approveERC20Token$}
          isApprovedERC20Token$={isApprovedERC20Token$}
          balances={[]}
        />
      </>
    ),
    [
      intl,
      validatePassword$,
      viewRuneTx,
      viewAssetTx,
      assetWD,
      symDepositFees$,
      selectedPricePoolAsset,
      reloadBalances,
      reloadShares,
      reloadSelectedPoolDetail,
      symDeposit$,
      network,
      approveERC20Token$,
      isApprovedERC20Token$
    ]
  )

  return FP.pipe(
    sequenceTRD(assetPriceRD, poolAssetsRD, poolDetailRD),
    RD.fold(
      renderDisabledAddDeposit,
      (_) => renderDisabledAddDeposit(),
      (error) => renderDisabledAddDeposit(error),
      ([assetPrice, poolAssets, poolDetail]) => {
        const filteredBalances = FP.pipe(
          walletBalances,
          O.map((balances) => filterWalletBalancesByAssets(balances, poolAssets)),
          O.getOrElse(() => [] as WalletBalances)
        )
        return (
          <>
            <SymDeposit
              validatePassword$={validatePassword$}
              viewRuneTx={viewRuneTx}
              viewAssetTx={viewAssetTx}
              poolData={toPoolData(poolDetail)}
              onChangeAsset={onChangeAsset}
              asset={assetWD}
              assetPrice={assetPrice}
              runePrice={runPrice}
              assetBalance={assetBalance}
              runeBalance={runeBalance}
              chainAssetBalance={chainAssetBalance}
              poolAddress={oPoolAddress}
              memos={depositTxMemo}
              fees$={symDepositFees$}
              reloadFees={reloadSymDepositFees}
              priceAsset={selectedPricePoolAsset}
              reloadBalances={reloadBalances}
              reloadShares={reloadShares}
              reloadSelectedPoolDetail={reloadSelectedPoolDetail}
              balances={filteredBalances}
              deposit$={symDeposit$}
              network={network}
              approveERC20Token$={approveERC20Token$}
              isApprovedERC20Token$={isApprovedERC20Token$}
            />
          </>
        )
      }
    )
  )
}
