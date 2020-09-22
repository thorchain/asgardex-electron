import { assetWB$, reloadBalances } from './balances'
import { client$, clientViewState$, address$ } from './common'
import { createTransactionService } from './transaction'

const { fees$, pushTx, reloadFees, txRD$ } = createTransactionService(client$)

/**
 * Re-export "public" functions and observables
 */
export { client$, clientViewState$, address$, reloadBalances, assetWB$, fees$, pushTx, reloadFees, txRD$ }
