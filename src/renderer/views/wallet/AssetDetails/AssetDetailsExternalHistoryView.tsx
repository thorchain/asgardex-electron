import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'

import { AssetDetails } from '../../../components/wallet/assets'
import { useWalletContext } from '../../../contexts/WalletContext'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { INITIAL_BALANCES_STATE } from '../../../services/wallet/const'
import { CommonAssetDetailsProps } from './types'

export const AssetDetailsExternalHistoryView: React.FC<CommonAssetDetailsProps> = ({
  walletAddress: oWalletAddress,
  network,
  asset,
  historyExtraContent
}) => {
  const { getTxs$, balancesState$, loadTxs, reloadBalancesByChain, getExplorerTxUrl$, resetTxsPage } =
    useWalletContext()

  const [txsRD] = useObservableState(() => getTxs$(oWalletAddress), RD.initial)
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

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
