import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'

import { LoadingView } from '../../components/shared/loading'
import { BackLink } from '../../components/uielements/backLink'
import { AssetDetails } from '../../components/wallet/assets'
import { useChainContext } from '../../contexts/ChainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { disableRuneUpgrade, isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../services/wallet/const'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const { clientByChain$ } = useChainContext()

  const {
    mimirHalt: { haltThorChain, haltEthChain, haltBnbChain }
  } = useMimirHalt()

  const { getTxs$, balancesState$, loadTxs, reloadBalancesByChain, selectedAsset$, resetTxsPage } = useWalletContext()

  const oSelectedAsset = useObservableState(selectedAsset$, O.none)

  const [txsRD] = useObservableState(
    () =>
      FP.pipe(
        oSelectedAsset,
        O.fold(
          () => Rx.of(RD.pending),
          ({ walletIndex, walletAddress }) => getTxs$(O.some(walletAddress), walletIndex)
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

  const [oClient] = useObservableState<O.Option<XChainClient>>(
    () =>
      FP.pipe(
        oSelectedAsset,
        O.fold(
          () => Rx.of(O.none),
          ({ asset }) => clientByChain$(asset.chain)
        )
      ),
    O.none
  )

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
      O.map(({ asset }) => asset.chain)
    )
  )

  return (
    <>
      <BackLink />
      {FP.pipe(
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
              reloadBalancesHandler={reloadBalancesByChain(asset.chain)}
              openExplorerTxUrl={openExplorerTxUrl}
              openExplorerAddressUrl={openExplorerAddressUrlHandler}
              walletAddress={walletAddress}
              disableSend={isRuneNativeAsset(asset) && haltThorChain}
              disableUpgrade={disableRuneUpgrade({
                asset,
                haltThorChain,
                haltEthChain,
                haltBnbChain,
                network
              })}
              network={network}
            />
          )
        )
      )}
    </>
  )
}
