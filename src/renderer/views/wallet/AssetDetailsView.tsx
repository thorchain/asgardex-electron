import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { AssetDetails } from '../../components/wallet/assets/AssetDetails'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const {
    txs$,
    balancesState$,
    loadTxs,
    reloadBalances$,
    setSelectedAsset,
    getExplorerTxUrl$,
    resetTxsPage
  } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(oSelectedAsset), [])

  const txsRD = useObservableState(txs$, RD.initial)
  const { balances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const [reloadBalances] = useObservableState(() => reloadBalances$.pipe(RxOp.map(O.toUndefined)))
  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  useEffect(() => {
    return () => resetTxsPage()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <AssetDetails
        txsPageRD={txsRD}
        balances={balances}
        asset={oSelectedAsset}
        loadTxsHandler={loadTxs}
        reloadBalancesHandler={reloadBalances}
        getExplorerTxUrl={getExplorerTxUrl}
      />
    </>
  )
}
