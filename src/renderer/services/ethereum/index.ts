import { ETHChain } from '@xchainjs/xchain-util'

import { reloadBalances, balances$ } from './balances'
import {
  client$,
  clientViewState$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
} from './common'
import { createFeesService } from './fees'
import { createApproveService, createTransactionService } from './transaction'

const { txs$, tx$, txStatus$, subscribeTx, resetTx, sendTx, txRD$ } = createTransactionService(client$)
const { approveERC20Token, isApprovedERC20Token } = createApproveService(client$)
const { reloadFees, fees$ } = createFeesService({ client$, chain: ETHChain })

export {
  client$,
  clientViewState$,
  address$,
  addressUI$,
  reloadBalances,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  balances$,
  txs$,
  tx$,
  txStatus$,
  sendTx,
  subscribeTx,
  resetTx,
  txRD$,
  reloadFees,
  fees$,
  approveERC20Token,
  isApprovedERC20Token
}
