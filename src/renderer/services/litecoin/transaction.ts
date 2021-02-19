import * as C from '../clients'
import { Client$ } from './types'
import { TransactionService } from './types'

export const createTransactionService: (client$: Client$) => TransactionService = C.createTransactionService
