import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import { THORChain } from '@xchainjs/xchain-thorchain'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { LoadingView } from '../../components/shared/loading'
import { AssetDetails } from '../../components/wallet/assets'
//import { useChainContext } from '../../contexts/ChainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { isRuneNativeAsset } from '../../helpers/assetHelper'
import { isCosmosChain } from '../../helpers/chainHelper'
import { eqOSelectedWalletAsset } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { clientByAsset$ } from '../../services/chain/client'
import { TxsPageRD } from '../../services/clients'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import { SelectedWalletAsset } from '../../services/wallet/types'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  //const { clientByChain$ } = useChainContext()

  const {
    mimirHalt: { haltTHORChain }
  } = useMimirHalt()

  const { getTxs$, balancesState$, loadTxs, reloadBalancesByChain, selectedAsset$, resetTxsPage } = useWalletContext()

  const oSelectedAsset = useObservableState(selectedAsset$, O.none)

  const [txsRD, updateTxsRD] = useObservableState<TxsPageRD, O.Option<SelectedWalletAsset>>(
    (selectedAssetUpdated$) =>
      FP.pipe(
        selectedAssetUpdated$,
        RxOp.distinctUntilChanged(eqOSelectedWalletAsset.equals),
        /*
          Disable txs history for Cosmos temporarily
          as long as an external API can't provide it - currently `https://lcd-cosmoshub.keplr.app`
          See https://github.com/thorchain/asgardex-electron/pull/2405
        */
        RxOp.switchMap(
          O.fold(
            () => Rx.of(RD.pending),
            ({ walletIndex, walletAddress, asset }) =>
              isCosmosChain(asset.chain) ? Rx.of(RD.initial) : getTxs$(O.some(walletAddress), walletIndex)
          )
        )
      ),
    RD.initial
  )

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

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
        sequenceTOption(oBalances, oSelectedAsset),
        O.map(([balances, { walletAddress }]) =>
          balances.filter((walletBalance) => walletBalance.walletAddress === walletAddress)
        ),
        O.chain(NEA.fromArray)
      ),
    [oBalances, oSelectedAsset]
  )

  const { network } = useNetwork()

  const [oClient, updateClient] = useObservableState<O.Option<XChainClient>, O.Option<SelectedWalletAsset>>(
    (selectedAssetUpdated$) =>
      FP.pipe(
        selectedAssetUpdated$,
        RxOp.distinctUntilChanged(eqOSelectedWalletAsset.equals),
        RxOp.switchMap(
          O.fold(
            () => Rx.of(O.none),
            ({ asset }) => clientByAsset$(asset)
          )
        )
      ),
    O.none
  )

  // Inform `useObservableState` about changes of `oSelectedAsset`
  useEffect(() => {
    updateTxsRD(oSelectedAsset)
    updateClient(oSelectedAsset)
  }, [oSelectedAsset, updateClient, updateTxsRD])

  const openExplorerAddressUrlHandler = useCallback(() => {
    FP.pipe(
      sequenceTOption(oClient, oSelectedAsset),
      O.map(async ([client, { walletAddress }]) => {
        const url = client.getExplorerAddressUrl(walletAddress)
        await window.apiUrl.openExternal(url)
        return true
      })
    )
  }, [oClient, oSelectedAsset])

  const { openExplorerTxUrl } = useOpenExplorerTxUrl(
    FP.pipe(
      oSelectedAsset,
      O.map(({ asset }) => (asset.synth ? THORChain : asset.chain))
    )
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => <LoadingView size="large" />,
      ({ asset, walletAddress, walletType }) => (
        <AssetDetails
          walletType={walletType}
          txsPageRD={txsRD}
          balances={walletBalances}
          asset={asset}
          loadTxsHandler={loadTxs}
          reloadBalancesHandler={reloadBalancesByChain(asset.synth ? THORChain : asset.chain)}
          openExplorerTxUrl={openExplorerTxUrl}
          openExplorerAddressUrl={openExplorerAddressUrlHandler}
          walletAddress={walletAddress}
          disableSend={isRuneNativeAsset(asset) && haltTHORChain}
          disableUpgrade={true}
          network={network}
        />
      )
    )
  )
}
