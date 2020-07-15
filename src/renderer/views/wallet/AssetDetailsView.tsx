import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { useObservableState } from 'observable-hooks'

import AssetDetails from '../../components/wallet/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const { txsSelectedAsset$ } = useBinanceContext()
  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  return <AssetDetails txsRD={txsRD} />
}
export default AssetDetailsView
