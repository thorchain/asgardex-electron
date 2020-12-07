import React, { useMemo } from 'react'

import { assetFromString } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/lib/Option'
import { useParams } from 'react-router-dom'

import { Receive } from '../../components/wallet/txs/receive'
import { ReceiveParams } from '../../routes/wallet'

export const ReceiveView: React.FC = (): JSX.Element => {
  const { asset, walletAddress } = useParams<ReceiveParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])

  return <Receive address={O.some(walletAddress)} asset={oSelectedAsset} />
}
