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
import { createTransactionService } from './transaction'

const {
  txs$,
  tx$,
  txStatus$,
  subscribeTx,
  resetTx,
  sendTx,
  txRD$,
  sendDepositTx$,
  approveERC20Token$,
  isApprovedERC20Token$
} = createTransactionService(client$)
const { reloadFees, fees$, callFees$, outTxFee$ } = createFeesService({ client$, chain: ETHChain })

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
  sendDepositTx$,
  callFees$,
  outTxFee$,
  approveERC20Token$,
  isApprovedERC20Token$
}
