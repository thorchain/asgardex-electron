import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { LedgerAddressRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = () =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getBTCAddress()),
    map(RD.success),
    startWith(RD.pending),
    catchError(() => Rx.of(RD.failure(Error('Could not get bitcoin address from ledger device'))))
  ).subscribe(setLedgerAddressRD)

const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial)
})

export { createLedgerService }
