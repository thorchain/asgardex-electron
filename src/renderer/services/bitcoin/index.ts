import { assetWB$, reloadBalances } from './balances'
import { client$, clientViewState$, address$, explorerUrl$ } from './common'
import { createTransactionService } from './transaction'

const { fees$, pushTx, reloadFees, txRD$, resetTx } = createTransactionService(client$)

/**
 * Re-export "public" functions and observables
 */
export {
  client$,
  clientViewState$,
  address$,
  explorerUrl$,
  reloadBalances,
  assetWB$,
  fees$,
  pushTx,
  reloadFees,
  txRD$,
  resetTx
}
