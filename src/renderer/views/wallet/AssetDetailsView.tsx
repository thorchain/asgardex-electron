import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, XChainClient } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { WalletType } from '../../../shared/wallet/types'
import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { AssetDetails } from '../../components/wallet/assets'
import { useChainContext } from '../../contexts/ChainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { disableRuneUpgrade, getAssetFromNullableString, isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { AssetDetailsParams } from '../../routes/wallet'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../services/wallet/const'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const {
    asset: routeAsset,
    walletAddress,
    walletType,
    walletIndex: walletIndexRoute = '0'
  } = useParams<AssetDetailsParams>()

  const walletIndex = parseInt(walletIndexRoute)
  const oWalletType: O.Option<WalletType> = O.fromNullable(walletType)

  const oRouteAsset: O.Option<Asset> = useMemo(() => getAssetFromNullableString(routeAsset), [routeAsset])
  const oWalletAddress = useMemo(
    () => FP.pipe(walletAddress, O.fromNullable, O.chain(O.fromPredicate<Address>(() => !!walletAddress))),
    [walletAddress]
  )

  const { clientByChain$ } = useChainContext()

  const {
    mimirHalt: { haltThorChain, haltEthChain, haltBnbChain }
  } = useMimirHalt()

  const { getTxs$, balancesState$, loadTxs, reloadBalancesByChain, setSelectedAsset, resetTxsPage } = useWalletContext()

  const [txsRD] = useObservableState(() => getTxs$(oWalletAddress, walletIndex), RD.initial)

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  useEffect(() => {
    setSelectedAsset(oRouteAsset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const { network } = useNetwork()

  const renderAssetError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              asset: routeAsset
            }
          )}
        />
      </>
    ),
    [routeAsset, intl]
  )

  const [oClient] = useObservableState<O.Option<XChainClient>>(
    () =>
      FP.pipe(
        oRouteAsset,
        O.fold(
          () => Rx.of(O.none),
          (asset) => clientByChain$(asset.chain)
        )
      ),
    O.none
  )

  const openExplorerAddressUrlHandler = useCallback(() => {
    FP.pipe(
      sequenceTOption(oClient, oWalletAddress),
      O.map(async ([client, address]) => {
        const url = client.getExplorerAddressUrl(address)
        await window.apiUrl.openExternal(url)
        return true
      })
    )
  }, [oClient, oWalletAddress])

  const { openExplorerTxUrl } = useOpenExplorerTxUrl(
    FP.pipe(
      oRouteAsset,
      O.map(({ chain }) => chain)
    )
  )

  return (
    <>
      {FP.pipe(
        sequenceTOption(oRouteAsset, oWalletType),
        O.fold(
          () => renderAssetError,
          ([asset, walletType]) => (
            <AssetDetails
              walletType={walletType}
              walletIndex={walletIndex}
              txsPageRD={txsRD}
              balances={walletBalances}
              asset={asset}
              loadTxsHandler={loadTxs}
              reloadBalancesHandler={reloadBalancesByChain(asset.chain)}
              openExplorerTxUrl={openExplorerTxUrl}
              openExplorerAddressUrl={openExplorerAddressUrlHandler}
              walletAddress={oWalletAddress}
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
