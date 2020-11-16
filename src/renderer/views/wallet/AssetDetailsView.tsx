import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { AssetDetails } from '../../components/wallet/assets/AssetDetails'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const {
    txs$,
    assetsWBState$,
    loadTxsHandler$,
    reloadBalances$,
    setSelectedAsset,
    getExplorerTxUrl$,
    resetTxsPageByChain
  } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(oSelectedAsset), [])

  const txsRD = useObservableState(txs$, RD.initial)
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const [reloadBalances] = useObservableState(() => reloadBalances$.pipe(RxOp.map(O.toUndefined)))
  const loadTxsHandler = useObservableState(loadTxsHandler$, O.none)

  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  useEffect(() => {
    return () => {
      // reset page
      FP.pipe(
        oSelectedAsset,
        O.map(({ chain }) => {
          resetTxsPageByChain(chain)
          return true
        })
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTxsHandler])

  return (
    <>
      <AssetDetails
        txsPageRD={txsRD}
        assetsWB={assetsWB}
        asset={oSelectedAsset}
        loadTxsHandler={loadTxsHandler}
        reloadBalancesHandler={reloadBalances}
        getExplorerTxUrl={getExplorerTxUrl}
      />
    </>
  )
}
