import React, { useCallback, useMemo, useRef } from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Client as ThorchainClient } from '@xchainjs/xchain-thorchain'
import { THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Bonds } from '../../components/Bonds'
import { useAppContext } from '../../contexts/AppContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useUserNodesContext } from '../../contexts/UserNodesContext'
import { useValidateAddress } from '../../hooks/useValidateAddress'
import { DEFAULT_NETWORK } from '../../services/const'
import { NodeInfoLD, NodeDataRD } from '../../services/thorchain/types'

type Node = {
  nodeAddress: Address
  data: NodeDataRD
}

export const BondsView: React.FC = (): JSX.Element => {
  const { client$, getNodeInfo$ } = useThorchainContext()
  const { userNodes$, addNodeAddress, removeNodeByAddress: removeNodeByAddressService } = useUserNodesContext()

  const oClient = useObservableState<O.Option<ThorchainClient>>(client$, O.none)

  const { validateAddress } = useValidateAddress(THORChain)

  const goToExplorerNodeAddress = useCallback(
    (address: Address) =>
      FP.pipe(
        oClient,
        O.map((client) => client.getExplorerAddressUrl(address)),
        O.map(window.apiUrl.openExternal)
      ),
    [oClient]
  )

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const userNodes = useObservableState(userNodes$, [])

  const nodeInfoCacheRef = useRef<Record<Address, NodeInfoLD>>({})

  const nodesInfo$: Rx.Observable<Node[]> = useMemo(
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
        NEA.fromArray,
        O.fold(
          /* If there is no userNodes return Rx.of([]) to trigger re-render:
           * returning Rx.EMPTY will not trigger any subscriptions when unwrapping
           * nodesInfo$ with useObservableState and nodesInfo will store previous value
           * with the last single result inside
           * */
          (): Rx.Observable<Node[]> => Rx.of([]),
          // Combine resulted Array<Observable> to Observable<Array>
          (nodesInfo) => Rx.combineLatest(nodesInfo)
        )
      ),
    [userNodes, getNodeInfo$, network]
  )

  const nodesInfo = useObservableState(nodesInfo$, [])

  const removeNodeByAddress = useCallback(
    (node: Address) => {
      if (nodeInfoCacheRef.current[node]) {
        // Also remove from cached results
        delete nodeInfoCacheRef.current[node]
      }
      removeNodeByAddressService(node, network)
    },
    [removeNodeByAddressService, network]
  )

  return (
    <Bonds
      addressValidation={validateAddress}
      nodes={nodesInfo}
      removeNode={removeNodeByAddress}
      goToNode={goToExplorerNodeAddress}
      network={network}
      addNode={addNodeAddress}
    />
  )
}
