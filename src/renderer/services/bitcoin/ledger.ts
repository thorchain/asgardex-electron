import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { LedgerAddressResponse } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { LedgerAddressRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const errorHandler = (value: LedgerAddressResponse) => {
  if (value.error) {
    return Promise.reject(value.error)
  }
  return Promise.resolve(value.result)
}

const retrieveLedgerAddress = () =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getBTCAddress()),
    switchMap((value) => Rx.from(errorHandler(value))),
    map(RD.success),
    startWith(RD.pending),
    catchError((err) => Rx.of(RD.failure(err)))
  ).subscribe(setLedgerAddressRD)

const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial)
})

export { createLedgerService }
