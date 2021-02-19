import React, { useCallback, useMemo } from 'react'

import { Asset, assetFromString, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router'

import { Network } from '../../../../shared/api/types'
import { ErrorView } from '../../../components/shared/error/'
import { BackLink } from '../../../components/uielements/backLink'
import { useAppContext } from '../../../contexts/AppContext'
import { useBitcoinContext } from '../../../contexts/BitcoinContext'
import { useWalletContext } from '../../../contexts/WalletContext'
import { SendParams } from '../../../routes/wallet'
import * as walletRoutes from '../../../routes/wallet'
import { DEFAULT_NETWORK } from '../../../services/const'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { SendViewBNB, SendViewBTC, SendViewETH } from './index'
import { SendViewTHOR } from './SendViewTHOR'

type Props = {}

export const SendView: React.FC<Props> = (): JSX.Element => {
  const { asset, walletAddress } = useParams<SendParams>()
  const intl = useIntl()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  const { balancesState$, getExplorerTxUrl$ } = useWalletContext()
  const { balances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)
  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  const { reloadFees: reloadBTCFees } = useBitcoinContext()

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
        case 'BNB':
          return (
            <SendViewBNB
              selectedAsset={asset}
              walletBalances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              network={network}
            />
          )
        case 'BTC':
          return (
            <SendViewBTC
              btcAsset={asset}
              balances={balances}
              reloadFeesHandler={reloadBTCFees}
              getExplorerTxUrl={getExplorerTxUrl}
              network={network}
            />
          )
        case 'ETH':
          return (
            <SendViewETH
              selectedAsset={asset}
              walletBalances={balances}
              getExplorerTxUrl={getExplorerTxUrl}
              network={network}
            />
          )
        case 'THOR':
          return (
            <SendViewTHOR thorAsset={asset} balances={balances} getExplorerTxUrl={getExplorerTxUrl} network={network} />
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
    [balances, getExplorerTxUrl, intl, reloadBTCFees, network]
  )

  return FP.pipe(
    oSelectedAsset,
    O.fold(
      () => renderAssetError,
      (asset) => (
        <>
          <BackLink path={walletRoutes.assetDetail.path({ asset: assetToString(asset), walletAddress })} />
          {renderSendView(asset)}
        </>
      )
    )
  )
}
