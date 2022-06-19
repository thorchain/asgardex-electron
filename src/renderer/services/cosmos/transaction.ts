import { Network$ } from '../app/types'
import * as C from '../clients'
import { Client$ } from './types'
import { TransactionService } from './types'

export const createTransactionService = (client$: Client$, _: Network$): TransactionService => {
  const common = C.createTransactionService(client$)

  return {
    ...common
  }
}
