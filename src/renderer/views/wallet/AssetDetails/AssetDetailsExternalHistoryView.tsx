import React, { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { useObservableState } from 'observable-hooks'

import { AssetDetails } from '../../../components/wallet/assets'
import { useWalletContext } from '../../../contexts/WalletContext'
import { CommonAssetDetailsProps } from './types'

export const AssetDetailsExternalHistoryView: React.FC<CommonAssetDetailsProps> = ({
  walletAddress: oWalletAddress,
  network,
  asset,
  historyExtraContent,
  balances: walletBalances,
  getExplorerTxUrl
}) => {
  const { getTxs$, loadTxs, reloadBalancesByChain, resetTxsPage } = useWalletContext()

  const [txsRD] = useObservableState(() => getTxs$(oWalletAddress), RD.initial)

  useEffect(() => {
    return () => resetTxsPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AssetDetails
      historyExtraContent={historyExtraContent}
      txsPageRD={txsRD}
      balances={walletBalances}
      asset={asset}
      loadTxsHandler={loadTxs}
      reloadBalancesHandler={reloadBalancesByChain(asset.chain)}
      getExplorerTxUrl={getExplorerTxUrl}
      walletAddress={oWalletAddress}
      network={network}
    />
  )
}
