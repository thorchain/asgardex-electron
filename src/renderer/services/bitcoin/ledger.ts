import * as RD from '@devexperts/remote-data-ts'
import { Network } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith } from 'rxjs/operators'

import { observableState } from '../../helpers/stateHelper'
import { LedgerAddressRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerMainnetAddress$, set: setLedgerMainnetAddressRD } = observableState<LedgerAddressRD>(RD.initial)
const { get$: ledgerTestnetAddress$, set: setLedgerTestnetAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = (network: Network) =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getBTCAddress(network)),
    map(RD.fromEither),
    startWith(RD.pending),
    catchError((error) => Rx.of(RD.failure(error)))
  ).subscribe((value) => {
    switch (network) {
      case 'testnet':
        setLedgerTestnetAddressRD(value)
        break
      default:
        setLedgerMainnetAddressRD(value)
        break
    }
  })

const resetLedgerAddress = (network: Network) => {
  switch (network) {
    case 'testnet':
      setLedgerTestnetAddressRD(RD.initial)
      break
    default:
      setLedgerMainnetAddressRD(RD.initial)
      break
  }
}

const createLedgerService = (): LedgerService => ({
  ledgerMainnetAddress$,
  ledgerTestnetAddress$,
  retrieveLedgerAddress,
  resetLedgerAddress
})

export { createLedgerService }
