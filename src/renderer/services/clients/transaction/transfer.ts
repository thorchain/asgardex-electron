import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../../helpers/stateHelper'
import { TxRD, TxLD, ErrorId } from '../../wallet/types'
import { XChainClient$ } from '../types'

export const createTransferService = <Client extends XChainClient, T extends XChainClient$<Client>>(client$: T) => {
  /**
   * State of a tx send by `subscribeTx`
   *
   * Note: Creates a state for EACH service
   * to avoid possible data merging between different chains
   */
  const { get$: txRD$, set: setTxRD } = observableState<TxRD>(RD.initial)

  /**
   * According to the Client's interface
   * first argument type of Client.transfer method
   * is an object of TxParams.
   * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-client/src/types.ts#L96
   *
   *  In common-client case
   * this parameters might be extended so we need this generic type
   * to have an access to params "real" type value for specific chain
   * @example BTC client has extended TxParams interface
   * @see https://github.com/xchainjs/xchainjs-lib/blob/master/packages/xchain-bitcoin/src/client.ts#L396
   */
  type TransferParams = Parameters<Client['transfer']>[0]

  const tx$ = (params: TransferParams): TxLD =>
    client$.pipe(
      RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      RxOp.switchMap((client) => Rx.from(client.transfer(params))),
      RxOp.map(RD.success),
      RxOp.catchError(
        (e): TxLD =>
          Rx.of(
            RD.failure({
              msg: e.toString(),
              errorId: ErrorId.SEND_TX
            })
          )
      ),
      RxOp.startWith(RD.pending)
    )

  /**
   * Sends a tx by given `TransferParams`
   */
  const sendTx = (params: TransferParams): TxLD => tx$(params)

  /**
   * Same as `sendTx`, but subscribing the result and store it into state
   */
  const subscribeTx = (params: TransferParams): Rx.Subscription => tx$(params).subscribe(setTxRD)

  return {
    txRD$,
    subscribeTx,
    sendTx,
    resetTx: () => setTxRD(RD.initial)
  }
}
