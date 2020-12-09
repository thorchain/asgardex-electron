import * as RD from '@devexperts/remote-data-ts'
import { Client as BitcoinClient } from '@xchainjs/xchain-bitcoin'
import * as Either from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'
import { catchError, map, startWith } from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { XChainClient$ } from '../clients'
import { ErrorId, LedgerAddressRD, TxLD, TxRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = (network: Network) =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getLedgerAddress('BTC', network)),
    map(RD.fromEither),
    startWith(RD.pending),
    catchError((error) => Rx.of(RD.failure(error)))
  ).subscribe(setLedgerAddressRD)

export const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial)
})

export const createLedgerTransferService = (client$: XChainClient$<BitcoinClient>) => {
  const { get$: ledgerTxRD$, set: setLedgerTxRD } = observableState<TxRD>(RD.initial)

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
  type TransferParams = Parameters<BitcoinClient['createTxForLedger']>[0]

  const ledgerTx$ = (params: TransferParams, network: Network): TxLD =>
    client$.pipe(
      RxOp.switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      RxOp.switchMap(async (client) => {
        const ledgerTxInfo = await client.createTxForLedger(params)
        const signResult = await window.apiHDWallet.signTxInLedger('BTC', network, ledgerTxInfo)
        if (Either.isRight(signResult)) {
          return await client.broadcastTx(signResult.right)
        } else {
          throw new Error('Ledger Error')
        }
      }),
      map(RD.success),
      startWith(RD.pending),
      catchError(
        (e): TxLD =>
          Rx.of(
            RD.failure({
              msg: e.toString(),
              errorId: ErrorId.SEND_TX
            })
          )
      )
    )

  const pushLedgerTx = (params: TransferParams, network: Network): Rx.Subscription =>
    ledgerTx$(params, network).subscribe(setLedgerTxRD)

  return {
    ledgerTxRD$,
    pushLedgerTx,
    resetLedgerTx: () => setLedgerTxRD(RD.initial)
  }
}
