import { TransactionService } from '../bitcoin/types'
import * as C from '../clients'
import { Client$ } from './types'

export const createTransactionService: (client$: Client$) => TransactionService = C.transactionServiceFactory
