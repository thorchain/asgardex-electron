import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset, assetFromString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Network } from '../../../../shared/api/types'
import { ErrorView } from '../../../components/shared/error'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { isEthAsset, isEthTokenAsset, isNonNativeRuneAsset, isRuneNativeAsset } from '../../../helpers/assetHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { AssetDetailsParams } from '../../../routes/wallet'
import { DEFAULT_NETWORK } from '../../../services/const'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { AssetDetailsExternalHistoryView } from './AssetDetailsExternalHistoryView'
import { AssetDetailsInternalHistoryView } from './AssetDetailsInternalHistoryView'
import * as Styled from './AssetDetailsView.styles'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const { asset: routeAsset, walletAddress } = useParams<AssetDetailsParams>()

  const [historyType, setHistoryType] = useState<'external' | 'internal'>('external')

  const oRouteAsset: O.Option<Asset> = useMemo(() => O.fromNullable(assetFromString(routeAsset)), [routeAsset])
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
  useEffect(() => setSelectedAsset(oRouteAsset), [])

  const { balancesState$, reloadBalancesByChain, setSelectedAsset, getExplorerTxUrl$ } = useWalletContext()

  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

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

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

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

  const renderHistoryExtraContent = useCallback(
    (asset: Asset) => (isLoading: boolean) => {
      if (!isNonNativeRuneAsset(asset) && (isRuneNativeAsset(asset) || isEthAsset(asset) || isEthTokenAsset(asset))) {
        return (
          <Styled.HistoryExtraContent>
            <Styled.HistoryTypeButton
              active={historyType === 'external' ? 'true' : 'false'}
              disabled={isLoading}
              onClick={() => setHistoryType('external')}>
              external
            </Styled.HistoryTypeButton>
            <Styled.HistoryTypeButton
              active={historyType === 'internal' ? 'true' : 'false'}
              disabled={isLoading}
              onClick={() => setHistoryType('internal')}>
              pool txs
            </Styled.HistoryTypeButton>
          </Styled.HistoryExtraContent>
        )
      }
    },
    [historyType, setHistoryType]
  )

  const RenderView = useMemo(
    () => (historyType === 'external' ? AssetDetailsExternalHistoryView : AssetDetailsInternalHistoryView),
    [historyType]
  )

  return (
    <>
      {FP.pipe(
        oRouteAsset,
        O.fold(
          () => renderAssetError,
          (asset) => (
            <RenderView
              historyExtraContent={renderHistoryExtraContent(asset)}
              balances={walletBalances}
              asset={asset}
              reloadBalancesHandler={reloadBalancesByChain(asset.chain)}
              getExplorerTxUrl={getExplorerTxUrl}
              walletAddress={oWalletAddress}
              network={network}
            />
          )
        )
      )}
    </>
  )
}
