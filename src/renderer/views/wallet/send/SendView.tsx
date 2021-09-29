import React, { useCallback, useMemo } from 'react'

import {
  Asset,
  assetFromString,
  assetToString,
  BCHChain,
  BNBChain,
  BTCChain,
  ETHChain,
  LTCChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { ErrorView } from '../../../components/shared/error/'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { useOpenExplorerTxUrl } from '../../../hooks/useOpenExplorerTxUrl'
import { SendParams } from '../../../routes/wallet'
import * as walletRoutes from '../../../routes/wallet'
import { OpenExplorerTxUrl } from '../../../services/clients'
import { DEFAULT_NETWORK } from '../../../services/const'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SendViewBNB, SendViewBCH, SendViewBTC, SendViewETH } from './index'
import { SendViewLTC } from './SendViewLTC'
import { SendViewTHOR } from './SendViewTHOR'

type Props = {}

export const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress, walletType, walletIndex } = useParams<SendParams>()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  const {
    balancesState$,
    keystoreService: { validatePassword$ }
  } = useWalletContext()

  const { balances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const openExplorerTxUrl: OpenExplorerTxUrl = useOpenExplorerTxUrl(
    FP.pipe(
      oSelectedAsset,
      O.map(({ chain }) => chain)
    )
  )

  const renderAssetError = useMemo(
    () => (
      <>
        <BackLink />
        <ErrorView
          title={intl.formatMessage(
            { id: 'routes.invalid.asset' },
            {
              asset
            }
          )}
        />
      </>
    ),
    [asset, intl]
  )

  const renderSendView = useCallback(
    (asset: Asset) => {
      switch (asset.chain) {
        case BNBChain:
          return (
            <SendViewBNB
              walletType={walletType}
              walletAddress={walletAddress}
              walletIndex={parseInt(walletIndex)}
              asset={asset}
              balances={balances}
              openExplorerTxUrl={openExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case BCHChain:
          return (
            <SendViewBCH
              walletType={walletType}
              asset={asset}
              balances={balances}
              openExplorerTxUrl={openExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case BTCChain:
          return (
            <SendViewBTC
              walletType={walletType}
              asset={asset}
              balances={balances}
              openExplorerTxUrl={openExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case ETHChain:
          return (
            <SendViewETH
              walletType={walletType}
              asset={asset}
              balances={balances}
              openExplorerTxUrl={openExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case THORChain:
          return (
            <SendViewTHOR
              walletType={walletType}
              walletAddress={walletAddress}
              asset={asset}
              balances={balances}
              openExplorerTxUrl={openExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        case LTCChain:
          return (
            <SendViewLTC
              walletType={walletType}
              asset={asset}
              balances={balances}
              openExplorerTxUrl={openExplorerTxUrl}
              validatePassword$={validatePassword$}
              network={network}
            />
          )
        default:
          return (
            <h1>
              {intl.formatMessage(
                { id: 'wallet.errors.invalidChain' },
                {
                  chain: asset.chain
                }
              )}
            </h1>
          )
      }
    },
    [walletType, walletAddress, walletIndex, balances, openExplorerTxUrl, validatePassword$, network, intl]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => renderAssetError,
      (asset) => (
        <>
          <BackLink
            path={walletRoutes.assetDetail.path({
              asset: assetToString(asset),
              walletAddress,
              walletType,
              walletIndex: walletIndex ? walletIndex : '0'
            })}
          />
          {renderSendView(asset)}
        </>
      )
    )
  )
}
