import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetFromString, BNBChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { AssetDetails } from '../../components/wallet/assets'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useChainContext } from '../../contexts/ChainContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneBnbAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { AssetDetailsParams } from '../../routes/wallet'
import { DEFAULT_NETWORK } from '../../services/const'
import { getPoolAddressByChain } from '../../services/midgard/utils'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const { asset, walletAddress } = useParams<AssetDetailsParams>()
  const oSelectedAsset: O.Option<Asset> = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])
  const oWalletAddress = useMemo(
    () =>
      FP.pipe(
        walletAddress,
        O.fromPredicate<Address>(() => !!walletAddress)
      ),
    [walletAddress]
  )

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(oSelectedAsset), [])

  const {
    getTxs$,
    balancesState$,
    loadTxs,
    reloadBalances$,
    setSelectedAsset,
    getExplorerTxUrl$,
    resetTxsPage,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const {
    service: {
      pools: { poolAddresses$ }
    }
  } = useMidgardContext()

  const oRuneBnbAsset: O.Option<Asset> = useMemo(
    () =>
      FP.pipe(
        oSelectedAsset,
        // We do need bnb pool address for BNB.RUNE assets only
        O.filter(isRuneBnbAsset)
      ),
    [oSelectedAsset]
  )

  const [bnbPoolAddress] = useObservableState(
    () =>
      FP.pipe(
        oRuneBnbAsset,
        O.fold(
          // No subscription of `poolAddresses$ ` needed for other assets than BNB.RUNE
          () => Rx.of(O.none),
          (_) =>
            FP.pipe(
              poolAddresses$,
              liveData.map((endpoints) => getPoolAddressByChain(endpoints, BNBChain)),
              RxOp.map(FP.flow(RD.toOption, O.flatten))
            )
        )
      ),
    O.none
  )

  const { addressByChain$ } = useChainContext()

  const { sendTx: sendUpgradeTx, fees$, reloadFees: reloadUpgradeFee } = useBinanceContext()

  const [upgradeFee] = useObservableState(
    () =>
      FP.pipe(
        oRuneBnbAsset,
        O.fold(
          // No subscription of `fees$ ` needed for other assets than BNB.RUNE
          () => Rx.EMPTY,
          (_) =>
            FP.pipe(
              fees$,
              liveData.map((fees) => fees.fast)
            )
        )
      ),
    RD.initial
  )

  const [txsRD] = useObservableState(() => getTxs$(oWalletAddress), RD.initial)
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const [reloadBalances] = useObservableState(() => reloadBalances$.pipe(RxOp.map(O.toUndefined)))
  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  useEffect(() => {
    return () => resetTxsPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Need to filter balances only for appropriate wallet
   * as AssetDetails uses just A.findFirst by asset and
   * the first result might be not from needed wallet
   */
  const walletBalances = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oBalances, oWalletAddress),
        O.map(([balances, walletAddress]) =>
          balances.filter((walletBalance) => walletBalance.walletAddress === walletAddress)
        ),
        O.chain(NEA.fromArray)
      ),
    [oBalances, oWalletAddress]
  )

  const [oRuneNativeAddress] = useObservableState(
    () =>
      FP.pipe(
        oSelectedAsset,
        // We do need rune native address to upgrade BNB.RUNE only
        O.filter(isRuneBnbAsset),
        O.fold(
          // No subscription of `poolAddresses$ ` needed for other assets than BNB.RUNE
          () => Rx.of(O.none),
          () => addressByChain$(THORChain)
        )
      ),
    O.none
  )

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  return (
    <>
      <AssetDetails
        txsPageRD={txsRD}
        balances={walletBalances}
        asset={oSelectedAsset}
        loadTxsHandler={loadTxs}
        reloadBalancesHandler={reloadBalances}
        getExplorerTxUrl={getExplorerTxUrl}
        walletAddress={oWalletAddress}
        runeNativeAddress={oRuneNativeAddress}
        poolAddress={bnbPoolAddress}
        validatePassword$={validatePassword$}
        sendUpgradeTx={sendUpgradeTx}
        upgradeFee={upgradeFee}
        reloadUpgradeFeeHandler={reloadUpgradeFee}
        network={network}
      />
    </>
  )
}
