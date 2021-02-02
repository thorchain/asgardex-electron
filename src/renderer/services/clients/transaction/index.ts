import { XChainClient$ } from '../types'
import * as H from './history'
import { txStatus$ } from './status'
import { createTransferService } from './transfer'

export const createTransactionService = (client$: XChainClient$) => {
  return {
    txs$: H.txsByClient$(client$),
    tx$: H.txByClient$(client$),
    txStatus$: txStatus$(client$),
    ...createTransferService(client$)
  }
}
