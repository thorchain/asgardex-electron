import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, assetToString } from '@thorchain/asgardex-util'
import { eqString } from 'fp-ts/lib/Eq'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import AssetDetails from '../../components/wallet/assets/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const { txsSelectedAsset$, address$, setSelectedAsset } = useBinanceContext()
  const { assetsWBState$, reloadBalancesByChain, explorerTxUrlByChain$, reloadAssetTxsByChain } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const oSelectedAsset = O.fromNullable(assetFromString(asset))

  const assetTxsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const address = useObservableState(address$, O.none)
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const prevAssetString = useRef('')

  const explorerTxUrl$ = FP.pipe(
    oSelectedAsset,
    O.fold(
      () => Rx.of(O.none),
      ({ chain }) => explorerTxUrlByChain$(chain)
    )
  )
  const explorerTxUrl = useObservableState(explorerTxUrl$, O.none)

  // Set selected asset to trigger dependent streams to get all needed data (such as its transactions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // useEffect(() => setSelectedAsset(oSelectedAsset), [])

  const renderContent = useMemo(
    () =>
      FP.pipe(
        oSelectedAsset,
        O.filter((asset) => !eqString.equals(assetToString(asset), prevAssetString.current)),
        O.fold(
          () => <></>,
          (asset) => {
            const { chain } = asset
            console.log('render table 22:', chain)
            prevAssetString.current = assetToString(asset)
            return (
              <h1>render {chain} </h1>
              // <AssetDetails
              //   txsPageRD={RD.initial}
              //   // txsPageRD={assetTxsRD}
              //   address={address}
              //   assetsWB={assetsWB}
              //   asset={O.some(asset)}
              //   reloadAssetTxsHandler={undefined}
              //   reloadBalancesHandler={undefined}
              //   // reloadAssetTxsHandler={reloadAssetTxsByChain(chain)}
              //   // reloadBalancesHandler={reloadBalancesByChain(chain)}
              //   explorerTxUrl={explorerTxUrl}
              // />
            )
          }
        )
      ),
    [oSelectedAsset]
  )

  return renderContent
}
export default AssetDetailsView
