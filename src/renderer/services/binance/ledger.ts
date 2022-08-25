import * as RD from '@devexperts/remote-data-ts'
import { TxParams } from '@xchainjs/xchain-client'
import * as Rx from 'rxjs'

import { LedgerBNBTxParams, LedgerErrorId, Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { LedgerTxHashLD, LedgerTxHashRD } from '../wallet/types'
import { LedgerService } from './types'

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
  ledgerTxRD$,
  pushLedgerTx,
  resetLedgerTx: () => setLedgerTxRD(RD.initial)
})
