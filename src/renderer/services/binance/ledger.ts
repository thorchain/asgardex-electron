import * as RD from '@devexperts/remote-data-ts'
import { Client } from '@xchainjs/xchain-binance'
import { Address, TxParams } from '@xchainjs/xchain-client'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { LedgerBNBTxInfo, Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { XChainClient$ } from '../clients'
import { ErrorId, LedgerAddressRD, LedgerTxLD, LedgerTxRD } from '../wallet/types'
import { LedgerService } from './types'

export const createLedgerService = <T extends XChainClient$<Client>>(client$: T): LedgerService => {
  const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

  const retrieveLedgerAddress = (network: Network) =>
    FP.pipe(
      Rx.from(window.apiHDWallet.getLedgerAddress('BNB', network)),
      map(RD.fromEither),
      startWith(RD.pending),
      catchError((error) => Rx.of(RD.failure(error)))
    ).subscribe(setLedgerAddressRD)

  const { get$: ledgerTxRD$, set: setLedgerTxRD } = observableState<LedgerTxRD>(RD.initial)

  const handleLedgerPresign = () => {}
  const handleLedgerVerifySuccess = () => {}
  const handleLedgerVerifyFailed = () => {
    setLedgerTxRD(
      RD.failure({
        msg: 'Ledger Verification Failed',
        errorId: ErrorId.SEND_LEDGER_TX
      })
    )
  }

  const ledgerTx$ = (params: TxParams & { sender: Address; network: Network }): LedgerTxLD =>
    client$.pipe(
      switchMap((oClient) => (O.isSome(oClient) ? Rx.of(oClient.value) : Rx.EMPTY)),
      switchMap((client) => Rx.from(client.getBncClient)),
      switchMap((bncClient) =>
        Rx.from(
          window.apiHDWallet.signTxInLedger('BNB', params.network, {
            ...params,
            client: bncClient,
            handleLedgerPresign,
            handleLedgerVerifySuccess,
            handleLedgerVerifyFailed
          } as LedgerBNBTxInfo)
        )
      ),
      switchMap(
        E.fold(
          (ledgerErrorId) => Rx.from(Promise.reject({ ledgerErrorId })),
          (txid) => Rx.from(Promise.resolve(txid))
        )
      ),
      map(RD.success),
      startWith(RD.pending),
      catchError(
        (e): LedgerTxLD =>
          Rx.of(
            RD.failure({
              msg: '',
              errorId: ErrorId.SEND_LEDGER_TX,
              ledgerErrorId: e
            })
          )
      )
    )

  const pushLedgerTx = (params: TxParams & { sender: Address; network: Network }): Rx.Subscription =>
    ledgerTx$(params).subscribe(setLedgerTxRD)

  return {
    ledgerAddress$,
    retrieveLedgerAddress,
    removeLedgerAddress: () => setLedgerAddressRD(RD.initial),
    ledgerTxRD$,
    pushLedgerTx,
    resetLedgerTx: () => setLedgerTxRD(RD.initial)
  }
}
