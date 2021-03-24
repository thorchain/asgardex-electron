import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString, BaseAmount, bn } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../../shared/api/types'
import { AsymDeposit } from '../../../components/deposit/add'
import { Alert } from '../../../components/uielements/alert'
import { ZERO_BN, ZERO_POOL_DATA } from '../../../const'
import { useAppContext } from '../../../contexts/AppContext'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqAsset } from '../../../helpers/fp/eq'
import { sequenceTRD } from '../../../helpers/fpHelpers'
import { getAssetPoolPrice } from '../../../helpers/poolHelper'
import * as depositRoutes from '../../../routes/deposit'
import { Memo } from '../../../services/chain/types'
import { DEFAULT_NETWORK } from '../../../services/const'
import { PoolAddress, PoolAssetsRD, PoolDetailRD } from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import { getBalanceByAsset } from '../../../services/wallet/util'
import { WalletBalances } from '../../../types/wallet'

type Props = {
  asset: Asset
}

export const AsymDepositView: React.FC<Props> = ({ asset }) => {
  const history = useHistory()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(depositRoutes.deposit.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const {
    service: {
      pools: { availableAssets$, priceRatio$, selectedPricePoolAsset$, poolDetail$, selectedPoolAddress$ },
      shares: { reloadShares }
    }
  } = useMidgardContext()

  const {
    asymDepositFee$,
    asymDeposit$,
    reloadAsymDepositFee,
    asymDepositTxMemo$,
    getExplorerUrlByAsset$
  } = useChainContext()

  const oPoolAddress: O.Option<PoolAddress> = useObservableState(selectedPoolAddress$, O.none)

  const {
    balancesState$,
    reloadBalances,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const runPrice = useObservableState(priceRatio$, bn(1))
  const [selectedPricePoolAsset] = useObservableState(() => FP.pipe(selectedPricePoolAsset$, RxOp.map(O.toUndefined)))

  const [walletBalances] = useObservableState(
    () =>
      FP.pipe(
        balancesState$,
        RxOp.map((state) => state.balances)
      ),
    O.none
  )

  const reloadBalancesAndShares = useCallback(() => {
    reloadBalances()
    reloadShares(5000)
  }, [reloadBalances, reloadShares])

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)

  const assetBalance: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        walletBalances,
        O.chain(getBalanceByAsset(asset)),
        O.map(({ amount }) => amount)
      ),
    [asset, walletBalances]
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

  const memo: O.Option<Memo> = useObservableState(asymDepositTxMemo$, O.none)

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

  const renderDisabledAddDeposit = useCallback(
    (error?: Error) => (
      <>
        {error && (
          <Alert type="error" message={intl.formatMessage({ id: 'common.error' })} description={error.toString()} />
        )}
        <AsymDeposit
          validatePassword$={validatePassword$}
          viewAssetTx={viewAssetTx}
          onChangeAsset={FP.constVoid}
          asset={asset}
          assetPrice={ZERO_BN}
          assetBalance={O.none}
          chainAssetBalance={O.none}
          fees$={asymDepositFee$}
          reloadFees={FP.constVoid}
          priceAsset={selectedPricePoolAsset}
          disabled={true}
          poolAddress={O.none}
          memo={O.none}
          reloadBalances={reloadBalancesAndShares}
          poolData={ZERO_POOL_DATA}
          deposit$={asymDeposit$}
          network={network}
          balances={[]}
        />
      </>
    ),
    [
      intl,
      validatePassword$,
      viewAssetTx,
      asset,
      asymDepositFee$,
      selectedPricePoolAsset,
      reloadBalancesAndShares,
      asymDeposit$,
      network
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
          O.map((balances) =>
            balances.filter((balance) => poolAssets.findIndex((asset) => eqAsset.equals(asset, balance.asset)) >= 0)
          ),
          O.getOrElse(() => [] as WalletBalances)
        )
        return (
          <>
            <AsymDeposit
              validatePassword$={validatePassword$}
              viewAssetTx={viewAssetTx}
              poolData={toPoolData(poolDetail)}
              onChangeAsset={onChangeAsset}
              asset={asset}
              assetPrice={assetPrice}
              assetBalance={assetBalance}
              chainAssetBalance={chainAssetBalance}
              poolAddress={oPoolAddress}
              memo={memo}
              fees$={asymDepositFee$}
              reloadFees={reloadAsymDepositFee}
              priceAsset={selectedPricePoolAsset}
              reloadBalances={reloadBalancesAndShares}
              balances={filteredBalances}
              deposit$={asymDeposit$}
              network={network}
            />
          </>
        )
      }
    )
  )
}
