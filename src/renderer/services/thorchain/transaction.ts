import * as C from '../clients'
import { TransactionService } from './types'
import { Client$ } from './types'

export const createTransactionService: (client$: Client$) => TransactionService = C.transactionServiceFactory
