import * as RD from '@devexperts/remote-data-ts'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith, switchMap } from 'rxjs/operators'

import { LedgerErrorId } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { LedgerAddressRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const errorHandler = (value: E.Either<LedgerErrorId, string>) => {
  if (E.isLeft(value)) {
    return Promise.reject(value.left)
  }
  return Promise.resolve(value.right)
}

const retrieveLedgerAddress = () =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getBTCAddress()),
    switchMap((value) => Rx.from(errorHandler(value))),
    map(RD.success),
    startWith(RD.pending),
    catchError((error) => Rx.of(RD.failure(error)))
  ).subscribe(setLedgerAddressRD)

const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial)
})

export { createLedgerService }
