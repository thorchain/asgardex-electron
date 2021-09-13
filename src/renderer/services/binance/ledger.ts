import * as RD from '@devexperts/remote-data-ts'
import { TxParams } from '@xchainjs/xchain-client'
import { BNBChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { catchError, map, startWith } from 'rxjs/operators'

import { LedgerBNBTxParams, LedgerError, LedgerErrorId, Network } from '../../../shared/api/types'
import { isError } from '../../../shared/utils/guard'
import { observableState } from '../../helpers/stateHelper'
import { LedgerAddressRD, LedgerTxHashLD, LedgerTxHashRD } from '../wallet/types'
import { LedgerService } from './types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

const retrieveLedgerAddress = (network: Network) =>
  FP.pipe(
    Rx.from(window.apiHDWallet.getLedgerAddress({ chain: BNBChain, network })),
    map(RD.fromEither),
    startWith(RD.pending),
    catchError((error) =>
      Rx.of(
        RD.failure<LedgerError>({
          errorId: LedgerErrorId.GET_ADDRESS_FAILED,
          msg: isError(error) ? error.toString() : `${error}`
        })
      )
    )
  ).subscribe((v) => setLedgerAddressRD(v))

const { get$: ledgerTxRD$, set: setLedgerTxRD } = observableState<LedgerTxHashRD>(RD.initial)

const ledgerTx$ = (network: Network, params: TxParams): LedgerTxHashLD =>
  Rx.of(
    RD.failure({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: `Not implemented for BNB ${network} ${params}`
    })
  )

const pushLedgerTx = (network: Network, params: LedgerBNBTxParams): Rx.Subscription =>
  ledgerTx$(network, params).subscribe(setLedgerTxRD)

export const createLedgerService = (): LedgerService => ({
  ledgerAddress$,
  retrieveLedgerAddress,
  removeLedgerAddress: () => setLedgerAddressRD(RD.initial),
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx: () => setLedgerTxRD(RD.initial)
})
