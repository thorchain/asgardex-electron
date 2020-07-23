import React from 'react'

import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import Receive from '../../components/wallet/Receive'
import { useBinanceContext } from '../../contexts/BinanceContext'

const ReceiveView: React.FC = (): JSX.Element => {
  const { address$, selectedAsset$ } = useBinanceContext()
  const address = useObservableState(address$, O.none)
  const selectedAsset = useObservableState(selectedAsset$, O.none)

  return <Receive address={address} asset={selectedAsset} />
}

export default ReceiveView
