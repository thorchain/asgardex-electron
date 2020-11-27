import * as C from '../clients'
import { TransactionService, Client$ } from './types'

const createTransactionService: (client$: Client$) => TransactionService = C.transactionServiceFactory

export { createTransactionService }
