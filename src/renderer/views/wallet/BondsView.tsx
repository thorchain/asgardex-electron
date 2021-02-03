import React, { useCallback, useMemo, useRef } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Client as ThorchainClient } from '@xchainjs/xchain-thorchain'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Bonds } from '../../components/Bonds'
import { useAppContext } from '../../contexts/AppContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useUserNodesContext } from '../../contexts/UserNodesContext'
import { AddressValidation } from '../../services/bitcoin/types'
import { DEFAULT_NETWORK } from '../../services/const'
import { NodeInfoLD } from '../../services/thorchain/types'

export const BondsView: React.FC = (): JSX.Element => {
  const { client$, getNodeInfo$ } = useThorchainContext()
  const { userNodes$, addNodeAddress, removeNodeByAddress } = useUserNodesContext()

  const oClient = useObservableState<O.Option<ThorchainClient>>(client$, O.none)

  const validateAddress = useMemo(
    () =>
      FP.pipe(
        oClient,
        O.map((c) => c.validateAddress),
        O.getOrElse((): AddressValidation => (_: string) => true)
      ),
    [oClient]
  )

  const goToNode = useCallback(
    (node: Address) =>
      FP.pipe(
        oClient,
        O.map((client) => client.getExplorerNodeUrl(node)),
        O.map(window.apiUrl.openExternal)
      ),
    [oClient]
  )

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const userNodes = useObservableState(userNodes$, [])

  const nodeInfoCacheRef = useRef<Record<Address, NodeInfoLD>>({})

  const nodesInfo$ = useMemo(
    () =>
      FP.pipe(
        userNodes,
        A.map((node) => {
          // Store previously created stream to avoid re-creating it in case if userNodes was changed
          if (!nodeInfoCacheRef.current[node]) {
            nodeInfoCacheRef.current[node] = FP.pipe(
              getNodeInfo$(node, network),
              /**
               * if `userNodes` changed here will be new stream created by combineLatest
               * cache with shareReplay(1) allows to avoid re-requesting data
               */
              RxOp.shareReplay(1)
            )
          }
          return FP.pipe(
            nodeInfoCacheRef.current[node],
            RxOp.map((data) => ({ data, nodeAddress: node }))
          )
        }),
        // Combine resulted Array<Observable> to Observable<Array>
        (nodesInfo) => Rx.combineLatest(nodesInfo)
      ),
    [userNodes, getNodeInfo$, network]
  )

  const nodesInfo = useObservableState(nodesInfo$, [])

  return (
    <Bonds
      addressValidation={validateAddress}
      nodes={nodesInfo}
      removeNode={removeNodeByAddress}
      goToNode={goToNode}
      network={network}
      addNode={addNodeAddress}
    />
  )
}
