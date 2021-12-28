import * as C from '../clients'
import { Client$, TransactionService } from './types'

export const createTransactionService: (client$: Client$) => TransactionService = C.createTransactionService
