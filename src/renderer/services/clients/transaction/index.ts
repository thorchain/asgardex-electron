import { TxParams } from '@xchainjs/xchain-client'

import { TransactionService, XChainClient$ } from '../types'
import * as H from './history'
import { txStatus$ } from './status'
import { createTransferService } from './transfer'

export const createTransactionService = (client$: XChainClient$): TransactionService<TxParams> => ({
  txs$: H.txsByClient$(client$),
  tx$: H.txByClient$(client$),
  txStatus$: txStatus$(client$),
  ...createTransferService(client$)
})
