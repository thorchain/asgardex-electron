import * as RD from '@devexperts/remote-data-ts'
import { BTCChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { LedgerBTCTxInfo, Network } from '../../../shared/api/types'
import { liveData } from '../../helpers/rx/liveData'
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

const ledgerTx$ = (network: Network, params: LedgerBTCTxInfo): LedgerTxLD =>
  FP.pipe(
    Rx.from(window.apiHDWallet.sendTxInLedger(BTCChain, network, params)),
    switchMap(liveData.fromEither),
    liveData.mapLeft((ledgerErrorId) => ({
      ledgerErrorId: ledgerErrorId,
      errorId: ErrorId.SEND_LEDGER_TX,
      msg: ''
    })),
    startWith(RD.pending)
  )

const pushLedgerTx = (network: Network, params: LedgerBTCTxInfo): Rx.Subscription =>
  ledgerTx$(network, params).subscribe(setLedgerTxRD)

export const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial),
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx: () => setLedgerTxRD(RD.initial)
})
