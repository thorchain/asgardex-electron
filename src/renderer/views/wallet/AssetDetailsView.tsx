import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import AssetDetails from '../../components/wallet/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { AssetDetailsParams } from '../../routes/wallet'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const {
    txsSelectedAsset$,
    address$,
    balancesState$,
    reloadBalances,
    reloadTxssSelectedAsset,
    explorerUrl$
  } = useBinanceContext()

  const { asset } = useParams<AssetDetailsParams>()
  const selectedAsset = O.fromNullable(assetFromString(asset))

  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const address = useObservableState(address$, O.none)
  const balancesRD = useObservableState(balancesState$, RD.initial)

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
