import * as RD from '@devexperts/remote-data-ts'
import * as BNB from '@xchainjs/xchain-binance'
import * as BTC from '@xchainjs/xchain-bitcoin'
import { XChainClient } from '@xchainjs/xchain-client'
import * as Cosmos from '@xchainjs/xchain-cosmos'
import * as ETH from '@xchainjs/xchain-ethereum'
import * as Polkadot from '@xchainjs/xchain-polkadot'
import * as THOR from '@xchainjs/xchain-thorchain'
import { BNBChain, BTCChain, Chain, CosmosChain, ETHChain, PolkadotChain, THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import { FeesLD, XChainClient$ } from './types'

const getDefaultFeesByChain = (chain: Chain) => {
  switch (chain) {
    case BNBChain:
      return BNB.getDefaultFees()
    case BTCChain:
      return BTC.getDefaultFees()
    case ETHChain:
      return ETH.getDefaultFees()
    case THORChain:
      return THOR.getDefaultFees()
    case CosmosChain:
      return Cosmos.getDefaultFees()
    case PolkadotChain:
      // TODO @Veado: Handle network
      return Polkadot.getDefaultFees('testnet')
  }
}

export const createFeesService = <Client extends XChainClient>({
  client$,
  chain
}: {
  client$: XChainClient$
  chain: Chain
}) => {
  /**
   * According to the Client's interface
   * first argument type of Client.getFees method
   * is an object of TxParams.
   * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-client/src/types.ts#L96
   *
   *  In common-client case
   * this parameters might be extended so we need this generic type
   * to have an access to params "real" type value for specific chain
   * @example ETH client has extended FeesParams interface
   * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-bitcoin/src/client.ts#L396
   */
  type FeesParams = Parameters<Client['getFees']>[0]

  // `TriggerStream` to reload `Fees`
  const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

  const fees$ = (params?: FeesParams): FeesLD =>
    Rx.combineLatest([reloadFees$, client$]).pipe(
      RxOp.switchMap(([_, oClient]) =>
        FP.pipe(
          oClient,
          // O.fold<XChainClient, Rx.Observable<XChainClient>>(
          O.fold(
            () => Rx.EMPTY,
            (client) => Rx.from(client.getFees(params))
          )
        )
      ),
      RxOp.map(RD.success),
      RxOp.catchError((_) => Rx.of(RD.success(getDefaultFeesByChain(chain)))),
      RxOp.startWith(RD.pending),
      RxOp.shareReplay(1)
    )

  //
  // RxOp.catchError((e) => Rx.of(RD.failure(e))),

  return {
    fees$,
    reloadFees
  }
}
