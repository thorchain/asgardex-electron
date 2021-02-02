import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Client as ThorchainClient } from '@xchainjs/xchain-thorchain'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Bonds } from '../../components/Bonds'
import { useAppContext } from '../../contexts/AppContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useUserNodesContext } from '../../contexts/UserNodesContext'
import { AddressValidation } from '../../services/bitcoin/types'
import { DEFAULT_NETWORK } from '../../services/const'

export const BondsView: React.FC = (): JSX.Element => {
  const { client$ } = useThorchainContext()
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

  const nodes$ = useMemo(
    () =>
      FP.pipe(
        userNodes$,
        RxOp.map(
          A.map((nodeAddress) => ({
            nodeAddress,
            data: RD.initial
          }))
        )
      ),
    [userNodes$]
  )

  const nodes = useObservableState(nodes$, [])

  return (
    <Bonds
      addressValidation={validateAddress}
      nodes={nodes}
      removeNode={removeNodeByAddress}
      goToNode={goToNode}
      network={network}
      addNode={addNodeAddress}
    />
  )
}
