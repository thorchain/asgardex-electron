import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import AssetDetails from '../../components/wallet/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const {
    txsSelectedAsset$,
    address$,
    balancesState$,
    selectedAsset$,
    reloadBalances,
    reloadTxssSelectedAsset,
    explorerUrl$
  } = useBinanceContext()
  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const address = useObservableState(address$, O.none)
  const balancesRD = useObservableState(balancesState$, RD.initial)
  const selectedAsset = useObservableState(selectedAsset$, O.none)
  const explorerUrl = useObservableState(explorerUrl$, O.none)

  return (
    <AssetDetails
      txsRD={txsRD}
      address={address}
      balancesRD={balancesRD}
      asset={selectedAsset}
      reloadSelectedAssetTxsHandler={reloadTxssSelectedAsset}
      reloadBalancesHandler={reloadBalances}
      explorerUrl={explorerUrl}
    />
  )
}
export default AssetDetailsView
