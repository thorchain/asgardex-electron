import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import { ErrorView } from '../../components/shared/error'
import { BackLink } from '../../components/uielements/backLink'
import { AssetDetails } from '../../components/wallet/assets'
import { useChainContext } from '../../contexts/ChainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { disableRuneUpgrade, getAssetFromNullableString, isRuneNativeAsset } from '../../helpers/assetHelper'
import { sequenceTOption } from '../../helpers/fpHelpers'
import {
  getWalletAddressFromNullableString,
  getWalletIndexFromNullableString,
  getWalletTypeFromNullableString
} from '../../helpers/walletHelper'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { useOpenExplorerTxUrl } from '../../hooks/useOpenExplorerTxUrl'
import { AssetDetailsParams } from '../../routes/wallet'
import { DEFAULT_BALANCES_FILTER, INITIAL_BALANCES_STATE } from '../../services/wallet/const'
import { ErrorId } from '../../services/wallet/types'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const {
    asset: routeAsset,
    walletAddress: routeWalletAddress,
    walletIndex: routeWalletIndex,
    walletType: routeWalletType
  } = useParams<AssetDetailsParams>()

  const oAsset = getAssetFromNullableString(routeAsset)
  const oWalletAddress = getWalletAddressFromNullableString(routeWalletAddress)
  const oWalletIndex = getWalletIndexFromNullableString(routeWalletIndex)
  const oWalletType = getWalletTypeFromNullableString(routeWalletType)

  const { clientByChain$ } = useChainContext()

  const {
    mimirHalt: { haltThorChain, haltEthChain, haltBnbChain }
  } = useMimirHalt()

  const { getTxs$, balancesState$, loadTxs, reloadBalancesByChain, setSelectedAsset, resetTxsPage } = useWalletContext()

  const [txsRD] = useObservableState(
    () =>
      FP.pipe(
        oWalletIndex,
        O.fold(
          () =>
            Rx.of(
              RD.failure({
                errorId: ErrorId.GET_ASSET_TXS,
                msg: intl.formatMessage(
                  { id: 'routes.invalid.params' },
                  {
                    params: `walletIndex: ${routeWalletIndex}`
                  }
                )
              })
            ),
          (walletIndex) => getTxs$(oWalletAddress, walletIndex)
        )
      ),

    RD.initial
  )

  const [{ balances: oBalances }] = useObservableState(
    () => balancesState$(DEFAULT_BALANCES_FILTER),
    INITIAL_BALANCES_STATE
  )

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  useEffect(() => {
    setSelectedAsset(oAsset)
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

  const renderRouteError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.params' },
            {
              params: `asset: ${routeAsset}, walletType: ${routeWalletType}, walletIndex: ${routeWalletIndex}, walletAddress: ${routeWalletAddress} `
            }
          )}
        />
      </>
    ),
    [intl, routeAsset, routeWalletAddress, routeWalletIndex, routeWalletType]
  )

  const [oClient] = useObservableState<O.Option<XChainClient>>(
    () =>
      FP.pipe(
        oAsset,
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
      oAsset,
      O.map(({ chain }) => chain)
    )
  )

  return (
    <>
      {FP.pipe(
        sequenceTOption(oAsset, oWalletAddress, oWalletIndex, oWalletType),
        O.fold(
          () => renderRouteError,
          ([asset, walletAddress, walletIndex, walletType]) => (
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
