import { reloadBalances, balances$ } from './balances'
import { client$, address$ } from './common'
import { createFeesService } from './fees'
import { createTransactionService } from './transaction'

const { txs$, pushTx, resetTx, sendDepositTx, txRD$ } = createTransactionService(client$)
const { reloadFees, fees$ } = createFeesService(client$)

export { address$, client$, reloadBalances, balances$, txs$, reloadFees, fees$, pushTx, resetTx, sendDepositTx, txRD$ }
