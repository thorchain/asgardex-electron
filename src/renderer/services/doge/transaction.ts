import * as C from '../clients'
import { TransactionService, Client$ } from './types'

const createTransactionService: (client$: Client$) => TransactionService = C.createTransactionService

export { createTransactionService }
