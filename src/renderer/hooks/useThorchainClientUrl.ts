import { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { NodeUrl } from '@xchainjs/xchain-thorchain'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxAjax from 'rxjs/ajax'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../shared/api/types'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { INITIAL_CLIENT_URL } from '../services/thorchain/const'
import { Configuration, HealthApi } from '../types/generated/thornode'
import { useNetwork } from './useNetwork'

export const useThorchainClientUrl = () => {
  const { clientUrl$, setClientUrl } = useThorchainContext()
  const { network } = useNetwork()
  const intl = useIntl()

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

  const checkNode$ = (url: string) =>
    FP.pipe(
      // Check `ping` endpoint
      new HealthApi(new Configuration({ basePath: url })).ping(),
      RxOp.map((result) => {
        const { ping } = result
        if (ping) return RD.success(url)

        return RD.failure(
          Error(intl.formatMessage({ id: 'setting.thornode.node.error.unhealthy' }, { endpoint: '/ping' }))
        )
      }),
      RxOp.catchError((_: Error) =>
        Rx.of(RD.failure(Error(`${intl.formatMessage({ id: 'setting.thornode.node.error.url' })}`)))
      )
    )

  const checkRpc$ = (url: string) =>
    FP.pipe(
      // Check `health` endpoint
      // https://docs.tendermint.com/v0.34/rpc/#/Info/health
      RxAjax.ajax(`${url}/health`),
      RxOp.map(({ response }) => {
        // Empty result object means no error
        if (response.result && typeof response.result === 'object' && Object.keys(response.result).length === 0)
          return RD.success(url)

        return RD.failure(
          Error(intl.formatMessage({ id: 'setting.thornode.rpc.error.unhealthy' }, { endpoint: '/health' }))
        )
      }),

      RxOp.catchError((_: Error) =>
        Rx.of(RD.failure(Error(`${intl.formatMessage({ id: 'thornode.url.error.invalid' })}`)))
      )
    )

  return { rpc: nodeUrl.rpc, node: nodeUrl.node, setRpc, setNode, checkNode$, checkRpc$ }
}
