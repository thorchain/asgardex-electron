import React, { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import AssetDetails from '../../components/wallet/assets/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const { txsSelectedAsset$, address$, loadTxsSelectedAsset, explorerUrl$, setSelectedAsset } = useBinanceContext()
  const { assetsWBState$, reloadBalancesByChain } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const selectedAsset = O.fromNullable(assetFromString(asset))

  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const address = useObservableState(address$, O.none)
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const reloadBalancesHandler = FP.pipe(
    selectedAsset,
    O.map(({ chain }) => () => reloadBalancesByChain(chain)),
    O.toUndefined
  )

  // Set selected asset to trigger dependent streams to get all needed data (such as its transactions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(selectedAsset), [])

  return (
    <>
      <AssetDetails
        txsRD={txsRD}
        address={address}
        assetsWB={assetsWB}
        asset={selectedAsset}
        loadSelectedAssetTxsHandler={loadTxsSelectedAsset}
        reloadBalancesHandler={reloadBalancesHandler}
        explorerUrl={explorerUrl}
      />
    </>
  )
}
export default AssetDetailsView
