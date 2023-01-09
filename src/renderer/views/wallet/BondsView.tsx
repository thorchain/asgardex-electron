import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Client as ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Address, THORChain } from '@xchainjs/xchain-util'
import { Row } from 'antd'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { Bonds } from '../../components/Bonds'
import { RefreshButton } from '../../components/uielements/button'
import { AssetsNav } from '../../components/wallet/assets'
import { useAppContext } from '../../contexts/AppContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useUserNodesContext } from '../../contexts/UserNodesContext'
import { useValidateAddress } from '../../hooks/useValidateAddress'
import { DEFAULT_NETWORK } from '../../services/const'
import { NodeInfosRD } from '../../services/thorchain/types'

export const BondsView: React.FC = (): JSX.Element => {
  const { client$, getNodeInfos$, reloadNodeInfos } = useThorchainContext()
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

  const [nodeInfos] = useObservableState<NodeInfosRD>(
    () =>
      FP.pipe(
        Rx.combineLatest([userNodes$, getNodeInfos$]),
        RxOp.switchMap(([userNodes, nodeInfos]) =>
          Rx.of(
            FP.pipe(
              nodeInfos,
              RD.map((data) =>
                FP.pipe(
                  data,
                  A.filter(({ address }) => userNodes.includes(address))
                )
              )
            )
          )
        )
      ),
    RD.initial
  )

  const loadingNodeInfos = useMemo(() => RD.isPending(nodeInfos), [nodeInfos])

  const removeNodeByAddress = useCallback(
    (node: Address) => {
      removeNodeByAddressService(node, network)
    },
    [removeNodeByAddressService, network]
  )

  return (
    <>
      <Row justify="end" style={{ marginBottom: '20px' }}>
        <RefreshButton onClick={reloadNodeInfos} disabled={loadingNodeInfos} />
      </Row>
      <AssetsNav />
      <Bonds
        addressValidation={validateAddress}
        nodes={nodeInfos}
        removeNode={removeNodeByAddress}
        goToNode={goToExplorerNodeAddress}
        network={network}
        addNode={addNodeAddress}
        reloadNodeInfos={reloadNodeInfos}
      />
    </>
  )
}
