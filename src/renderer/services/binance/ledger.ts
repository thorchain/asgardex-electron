import * as RD from '@devexperts/remote-data-ts'
import { BNBChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { LedgerBNCTxInfo, Network } from '../../../shared/api/types'
import { liveData } from '../../helpers/rx/liveData'
import { observableState } from '../../helpers/stateHelper'
import { ErrorId, LedgerAddressRD, LedgerTxHashLD, LedgerTxHashRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = (network: Network) =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getLedgerAddress(BNBChain, network)),
    map(RD.fromEither),
    startWith(RD.pending),
    catchError((error) => Rx.of(RD.failure(error)))
  ).subscribe(setLedgerAddressRD)

const { get$: ledgerTxRD$, set: setLedgerTxRD } = observableState<LedgerTxHashRD>(RD.initial)

const ledgerTx$ = (network: Network, params: LedgerBNCTxInfo): LedgerTxHashLD =>
  FP.pipe(
    Rx.from(window.apiHDWallet.sendTxInLedger(BNBChain, network, params)),
    switchMap(liveData.fromEither),
    liveData.mapLeft((ledgerErrorId) => ({
      ledgerErrorId: ledgerErrorId,
      errorId: ErrorId.SEND_LEDGER_TX,
      msg: ''
    })),
    startWith(RD.pending)
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
