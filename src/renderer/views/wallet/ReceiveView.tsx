import React from 'react'

import { none } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import Receive from '../../components/wallet/Receive'
import { useBinanceContext } from '../../contexts/BinanceContext'

const ReceiveView: React.FC = (): JSX.Element => {
  const { address$ } = useBinanceContext()
  const address = useObservableState(address$, none)

  return <Receive address={address} />
}

export default ReceiveView
