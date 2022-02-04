import * as RD from '@devexperts/remote-data-ts'
import * as BNB from '@xchainjs/xchain-binance'
import * as BTC from '@xchainjs/xchain-bitcoin'
import * as BCH from '@xchainjs/xchain-bitcoincash'
import { Fees } from '@xchainjs/xchain-client'
import * as Cosmos from '@xchainjs/xchain-cosmos'
import * as DOGE from '@xchainjs/xchain-doge'
import * as ETH from '@xchainjs/xchain-ethereum'
import * as Litecoin from '@xchainjs/xchain-litecoin'
import * as THOR from '@xchainjs/xchain-thorchain'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  LUNAChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { triggerStream } from '../../helpers/stateHelper'
import { FeesLD, XChainClient$, FeesService } from './types'

const getDefaultFeesByChain = (chain: Chain): Fees => {
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
      throw Error('Polkadot is not supported yet')
    case DOGEChain:
      return DOGE.getDefaultFees()
    case BCHChain:
      return BCH.getDefaultFees()
    case LTCChain:
      return Litecoin.getDefaultFees()
    case LUNAChain:
      // Waiting for https://github.com/xchainjs/xchainjs-lib/issues/480
      throw Error('Luna/Terra is not supported yet')
  }
}

/**
 * Common `FeesService` for (almost) all `Client`s
 * to provide `fees$` + `reloadFees`
 *
 * In some case you might to override it to accept custom params.
 * See `src/renderer/services/ethereum/fees.ts` as an example
 *
 */
export const createFeesService = ({ client$, chain }: { client$: XChainClient$; chain: Chain }): FeesService => {
  const { stream$: reloadFees$, trigger: reloadFees } = triggerStream()

  const fees$ = (): FeesLD =>
    Rx.combineLatest([reloadFees$, client$]).pipe(
      RxOp.switchMap(([_, oClient]) =>
        FP.pipe(
          oClient,
          O.fold(
            () => Rx.EMPTY,
            (client) => Rx.from(client.getFees())
          )
        )
      ),
      RxOp.map(RD.success),
      RxOp.catchError((_) => Rx.of(RD.success(getDefaultFeesByChain(chain)))),
      RxOp.startWith(RD.pending)
    )

  return {
    fees$,
    reloadFees
  }
}
