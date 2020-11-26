import * as C from '../clients'
import { Client$ } from './types'

export const createTransactionService = (client$: Client$) => {
  return {
    txs$: C.txs$(client$)
  }
}
