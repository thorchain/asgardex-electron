import React, { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import AssetDetails from '../../components/wallet/assets/AssetDetails'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const {
    assetTxs$,
    assetsWBState$,
    loadAssetTxs$,
    reloadBalances$,
    explorerTxUrl$,
    setSelectedAsset
  } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const selectedAsset = O.fromNullable(assetFromString(asset))

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(selectedAsset), [])

  const txsRD = useObservableState(assetTxs$, RD.initial)
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const [reloadBalances] = useObservableState(() => reloadBalances$.pipe(RxOp.map(O.toUndefined)))
  const [loadAssetTxs] = useObservableState(() => loadAssetTxs$.pipe(RxOp.map(O.toUndefined)))

  const explorerTxUrl = useObservableState(explorerTxUrl$, O.none)

  return (
    <>
      <AssetDetails
        txsPageRD={txsRD}
        assetsWB={assetsWB}
        asset={selectedAsset}
        loadAssetTxsHandler={loadAssetTxs}
        reloadBalancesHandler={reloadBalances}
        explorerTxUrl={explorerTxUrl}
      />
    </>
  )
}
export default AssetDetailsView
