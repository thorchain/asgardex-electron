import { useEffect } from 'react'

import { NodeUrl } from '@xchainjs/xchain-thorchain'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../shared/api/types'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { INITIAL_CLIENT_URL } from '../services/thorchain/const'
import { useNetwork } from './useNetwork'

export const useThorchainClientUrl = () => {
  const { clientUrl$, setClientUrl } = useThorchainContext()
  const { network } = useNetwork()

  const [nodeUrl, networkUpdated] = useObservableState<NodeUrl, Network>(
    (network$) =>
      FP.pipe(
        Rx.combineLatest([clientUrl$, network$]),
        RxOp.map(([clientUrl, network]) => clientUrl[network]),
        RxOp.shareReplay(1)
      ),
    INITIAL_CLIENT_URL[network]
  )

  // To update `useObservableState` properly
  // to push latest `network` into `nodeUrl`
  useEffect(() => networkUpdated(network), [network, networkUpdated])

  const setRpc = (url: string) => setClientUrl({ url, network, type: 'rpc' })
  const setNode = (url: string) => setClientUrl({ url, network, type: 'node' })

  return { rpc: nodeUrl.rpc, node: nodeUrl.node, setRpc, setNode }
}
