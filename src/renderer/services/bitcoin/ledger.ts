import * as RD from '@devexperts/remote-data-ts'
import { broadcastTx, createTxInfo, LedgerTxInfoParams } from '@xchainjs/xchain-bitcoin'
import { BTCChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { ErrorId, LedgerAddressRD, LedgerTxLD, LedgerTxRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = (network: Network) =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getLedgerAddress(BTCChain, network)),
    map(RD.fromEither),
    startWith(RD.pending),
    catchError((error) => Rx.of(RD.failure(error)))
  ).subscribe(setLedgerAddressRD)

const { get$: ledgerTxRD$, set: setLedgerTxRD } = observableState<LedgerTxRD>(RD.initial)

const ledgerTx$ = (params: LedgerTxInfoParams): LedgerTxLD =>
  FP.pipe(
    Rx.from(createTxInfo(params)),
    switchMap((ledgerTxInfo) => window.apiHDWallet.signTxInLedger(BTCChain, params.network, ledgerTxInfo)),
    switchMap(
      E.fold(
        (ledgerErrorId) => Rx.from(Promise.reject({ ledgerErrorId })),
        (txHex) => Rx.from(broadcastTx({ txHex, nodeUrl: params.nodeUrl, nodeApiKey: params.nodeApiKey }))
      )
    ),
    map(RD.success),
    startWith(RD.pending),
    catchError(
      (e): LedgerTxLD =>
        Rx.of(
          RD.failure({
            msg: !e.ledgerErrorId && e.toString(),
            errorId: ErrorId.SEND_LEDGER_TX,
            ledgerErrorId: e.ledgerErrorId
          })
        )
    )
  )

const pushLedgerTx = (params: LedgerTxInfoParams): Rx.Subscription => ledgerTx$(params).subscribe(setLedgerTxRD)

export const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial),
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx: () => setLedgerTxRD(RD.initial)
})
