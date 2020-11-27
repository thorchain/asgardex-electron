import * as C from '../clients'
import { Client$ } from './types'

// TODO (@veado | @thatStrangeGuyThorchain) More needed functions need to be added as defined in `TransactoinService` (clients/types) - will be done with other PRs
export const createTransactionService = (client$: Client$) => {
  return {
    txs$: C.txs$(client$)
  }
}
