import React, { useMemo } from 'react'

import { assetFromString } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { Receive } from '../../components/wallet/txs/receive'
import { useAppContext } from '../../contexts/AppContext'
import { ReceiveParams } from '../../routes/wallet'
import { DEFAULT_NETWORK } from '../../services/const'

export const ReceiveView: React.FC = (): JSX.Element => {
  const { asset, walletAddress } = useParams<ReceiveParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])
  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  return <Receive address={O.some(walletAddress)} asset={oSelectedAsset} network={network} />
}
