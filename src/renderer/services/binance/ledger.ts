import * as RD from '@devexperts/remote-data-ts'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { LedgerBNCTxInfo, Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { ErrorId, LedgerAddressRD, LedgerTxLD, LedgerTxRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = (network: Network) =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getLedgerAddress('BNB', network)),
    map(RD.fromEither),
    startWith(RD.pending),
    catchError((error) => Rx.of(RD.failure(error)))
  ).subscribe(setLedgerAddressRD)

const { get$: ledgerTxRD$, set: setLedgerTxRD } = observableState<LedgerTxRD>(RD.initial)

const ledgerTx$ = (network: Network, params: LedgerBNCTxInfo): LedgerTxLD =>
  FP.pipe(
    Rx.from(window.apiHDWallet.signTxInLedger('BNB', network, params)),
    switchMap(
      E.fold(
        (ledgerErrorId) => Promise.reject(ledgerErrorId),
        (txHash) => Promise.resolve(txHash)
      )
    ),
    map(RD.success),
    startWith(RD.pending),
    catchError(
      (ledgerErrorId): LedgerTxLD =>
        Rx.of(
          RD.failure({
            msg: '',
            errorId: ErrorId.SEND_LEDGER_TX,
            ledgerErrorId
          })
        )
    )
  )

const pushLedgerTx = (network: Network, params: LedgerBNCTxInfo): Rx.Subscription =>
  ledgerTx$(network, params).subscribe(setLedgerTxRD)

export const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial),
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx: () => setLedgerTxRD(RD.initial)
})
