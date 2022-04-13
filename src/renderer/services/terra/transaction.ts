import * as C from '../clients'
import { Client$ } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$): TransactionService => {
  const common = C.createTransactionService(client$)

  return {
    ...common
  }
}
