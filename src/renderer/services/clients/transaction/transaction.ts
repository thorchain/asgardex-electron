import { XChainClient$ } from '../types'
import * as H from './history'
import { createTransferService } from './transfer'

export const transactionServiceFactory = (client$: XChainClient$) => {
  return {
    txs$: H.txs$(client$),
    ...createTransferService(client$)
  }
}
