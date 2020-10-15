import React, { useMemo } from 'react'

import { assetFromString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import Receive from '../../components/wallet/txs/Receive'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { ReceiveParams } from '../../routes/wallet'

const ReceiveView: React.FC = (): JSX.Element => {
  const { asset } = useParams<ReceiveParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  const { address$ } = useBinanceContext()
  const address = useObservableState(address$, O.none)

  return <Receive address={address} asset={oSelectedAsset} />
}

export default ReceiveView
